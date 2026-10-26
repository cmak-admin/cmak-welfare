/* The only setting the shell needs: the deployed Apps Script web-app URL
   (Deploy › Manage deployments › Web app URL, ending in /exec).
   Keep the deployment ID the same when you publish new versions, so this
   never has to change. */
window.CMAK_CONFIG = {
  appsScriptUrl: 'https://script.google.com/macros/s/REPLACE_WITH_DEPLOYMENT_ID/exec'
};
