import * as restify from 'restify';
import { 
  CloudAdapter, 
  ConfigurationServiceClientCredentialFactory, 
  createBotFrameworkAuthenticationFromConfiguration,
  TurnContext,
  ActivityTypes
} from 'botbuilder';
import { SDRBot } from './bot/SDRBot';
import { BotConfiguration } from './config/BotConfiguration';

// Create HTTP server
const server = restify.createServer();
server.use(restify.plugins.bodyParser());

// Bot configuration
const botConfig = new BotConfiguration();

// Create adapter
const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
  MicrosoftAppId: botConfig.appId,
  MicrosoftAppPassword: botConfig.appPassword,
});

const botFrameworkAuthentication = createBotFrameworkAuthenticationFromConfiguration(null, credentialsFactory);

const adapter = new CloudAdapter(botFrameworkAuthentication);

// Catch-all for errors
const onTurnErrorHandler = async (context: TurnContext, error: Error) => {
  console.error(`\\n [onTurnError] unhandled error: ${error}`);
  console.error(error.stack);

  // Send a trace activity
  await context.sendTraceActivity(
    'OnTurnError Trace',
    `${error}`,
    'https://www.botframework.com/schemas/error',
    'TurnError'
  );

  // Send a message to the user
  await context.sendActivity('The bot encountered an error or bug.');
  await context.sendActivity('To continue to run this bot, please fix the bot source code.');
};

adapter.onTurnError = onTurnErrorHandler;

// Create the main dialog
const sdrBot = new SDRBot();

// Listen for incoming requests
server.post('/api/messages', async (req, res) => {
  await adapter.process(req, res, (context) => sdrBot.run(context));
});

// Health check endpoint
server.get('/api/health', (req, res, next) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  return next();
});

// Start server
const port = process.env.PORT || 3978;
server.listen(port, () => {
  console.log(`\\n${server.name} listening on port ${port}`);
  console.log(`\\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
  console.log(`\\nTo talk to your bot, open the emulator select "Open Bot"`);
});