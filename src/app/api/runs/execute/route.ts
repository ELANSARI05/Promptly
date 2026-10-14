import { NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticate, fail, readJson, ApiError, runFromRow } from '@/lib/server';
import { executeAgents } from '@/lib/executor';
import type { Agent } from '@/lib/types';
export const maxDuration = 120;
export async function POST(request: Request) {
  try {
    const { db, user } = await authenticate(request);
    const { planId } = z.object({ planId: z.string().uuid() }).parse(await readJson(request));
    if (!process.env.OPENAI_API_KEY)
      throw new ApiError('Live AI is not connected yet. No credits were spent.', 503);
    const { data: plan, error } = await db
      .from('plans')
      .select('*')
      .eq('id', planId)
      .eq('user_id', user.id)
      .single();
    if (error || !plan) throw new ApiError('This plan could not be found.', 404);
    const { data: claimed, error: claimError } = await db.rpc('claim_run', {
      p_plan_id: planId,
      p_user_id: user.id,
    });
    if (claimError)
      throw new ApiError(
        claimError.message.includes('balance')
          ? 'You do not have enough credits.'
          : claimError.message.includes('expired')
            ? 'This quote expired. Build a fresh plan.'
            : 'This plan is already running, was used, or another run is still active.',
        409,
      );
    const runId = String(claimed);
    try {
      const { result, outputs } = await executeAgents(plan.prompt, plan.agent_snapshot as Agent[]);
      const { error: finishError } = await db.rpc('finish_run', {
        p_run_id: runId,
        p_user_id: user.id,
        p_success: true,
        p_result: result,
        p_outputs: outputs,
      });
      if (finishError) throw finishError;
    } catch (e) {
      console.error(
        'Run execution failed:',
        e instanceof Error ? e.message : 'Unknown execution failure',
      );
      const { error: refundError } = await db.rpc('finish_run', {
        p_run_id: runId,
        p_user_id: user.id,
        p_success: false,
        p_result: 'This run could not complete. Reserved credits have been returned.',
        p_outputs: [],
      });
      if (refundError)
        throw new ApiError(
          'The run was interrupted. Refresh your workspace after five minutes to recover reserved credits.',
          503,
        );
      throw new ApiError(
        'The run could not complete. Your credits have been returned. Please try a new plan.',
        502,
      );
    }
    const { data: run, error: runError } = await db
      .from('runs')
      .select('*')
      .eq('id', runId)
      .eq('user_id', user.id)
      .single();
    if (runError) throw runError;
    return NextResponse.json(runFromRow(run));
  } catch (e) {
    return fail(e);
  }
}
