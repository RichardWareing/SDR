@description('Environment name')
param environment string

@description('Location for resources')
param location string

@description('Static Web App name')
param staticWebAppName string

@description('Resource tags')
param tags object = {}

// Static Web App
resource staticWebApp 'Microsoft.Web/staticSites@2022-09-01' = {
  name: staticWebAppName
  location: location
  tags: tags
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    templateBuildProperty: {
      appBuildCommand: 'npm run build'
      apiBuildCommand: 'npm run build --if-present'
      outputLocation: 'build'
    }
    stagingEnvironmentPolicy: 'Enabled'
    allowConfigFileUpdates: true
  }
}

// Outputs
output staticWebAppName string = staticWebAppName
output staticWebAppId string = staticWebApp.id
