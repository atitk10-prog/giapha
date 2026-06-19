/**
 * Settings shape + resolver for the `exhaustive-deps` rule. Honors
 * both the canonical `settings["react-doctor"].exhaustiveDeps`
 * namespace and the upstream `settings["react-hooks"]` shape so a
 * project migrating from `eslint-plugin-react-hooks` keeps the same
 * configuration.
 */
export interface ExhaustiveDepsSettings {
  additionalHooks?: string;
  additionalEffectHooks?: string;
  enableDangerousAutofixThisMayCauseInfiniteLoops?: boolean;
  experimental_autoDependenciesHooks?: ReadonlyArray<string>;
  requireExplicitEffectDeps?: boolean;
}

export const resolveExhaustiveDepsSettings = (
  settings: Readonly<Record<string, unknown>> | undefined,
): Required<ExhaustiveDepsSettings> => {
  const reactDoctor = settings?.["react-doctor"];
  const reactHooks = settings?.["react-hooks"];
  const ruleSettings =
    typeof reactDoctor === "object" && reactDoctor !== null
      ? ((reactDoctor as { exhaustiveDeps?: ExhaustiveDepsSettings }).exhaustiveDeps ?? {})
      : {};
  const upstreamSettings =
    typeof reactHooks === "object" && reactHooks !== null
      ? (reactHooks as ExhaustiveDepsSettings)
      : {};
  return {
    additionalHooks:
      ruleSettings.additionalHooks ??
      ruleSettings.additionalEffectHooks ??
      upstreamSettings.additionalHooks ??
      upstreamSettings.additionalEffectHooks ??
      "",
    additionalEffectHooks:
      ruleSettings.additionalEffectHooks ?? upstreamSettings.additionalEffectHooks ?? "",
    enableDangerousAutofixThisMayCauseInfiniteLoops:
      ruleSettings.enableDangerousAutofixThisMayCauseInfiniteLoops ?? false,
    experimental_autoDependenciesHooks:
      ruleSettings.experimental_autoDependenciesHooks ??
      upstreamSettings.experimental_autoDependenciesHooks ??
      [],
    requireExplicitEffectDeps:
      ruleSettings.requireExplicitEffectDeps ?? upstreamSettings.requireExplicitEffectDeps ?? false,
  };
};
