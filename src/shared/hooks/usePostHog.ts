/**
 * usePostHog - hook for initializing PostHog analytics (production only)
 *
 * Usage:
 *   usePostHog(); // call in AuthWrapper or App
 */

import { useEffect } from 'react';
import { isTestingBot } from '@/shared/utils/cookies';

// Global window extension for PostHog
declare global {
  interface Window {
    posthog?: unknown;
  }
}

/**
 * Initialize PostHog analytics (production only)
 */
function initPostHog() {
  // Skip in non-production
  if (!['test', 'production'].includes(process.env.NODE_ENV)) {
    return;
  }

  // Skip for automated test bots
  if (isTestingBot()) return;

  // Check if already loaded
  if (window.posthog) {
    return;
  }

  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.innerHTML = `
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog && window.posthog.__loaded)||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init Xr es pi Zr rs Kr Qr capture Ni calculateEventProperties os register register_once register_for_session unregister unregister_for_session ds getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey displaySurvey cancelPendingSurvey canRenderSurvey canRenderSurveyAsync identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException startExceptionAutocapture stopExceptionAutocapture loadToolbar get_property getSessionProperty us ns createPersonProfile hs Vr vs opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing get_explicit_consent_status is_capturing clear_opt_in_out_capturing ss debug O ls getPageViewId captureTraceFeedback captureTraceMetric qr".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    posthog.init('phc_BAdC1Me3Ty79IaO9tEYmfDvIYSs3Hj5D529RgyAabMl', {
      api_host: 'https://us.i.posthog.com',
      defaults: '2025-11-30',
      person_profiles: 'identified_only',
    });
  `;

  document.head.appendChild(script);
}

/**
 * Hook to initialize PostHog on component mount (production only)
 */
export const usePostHog = () => {
  useEffect(() => {
    initPostHog();
  }, []);
};

export default usePostHog;
