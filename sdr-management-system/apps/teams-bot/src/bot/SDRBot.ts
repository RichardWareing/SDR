import { 
  ActivityHandler, 
  TurnContext, 
  MessageFactory,
  CardFactory,
  ActivityTypes,
  TeamsInfo,
  TeamsActivityHandler
} from 'botbuilder';
import { SDRService } from '../services/SDRService';
import { AdaptiveCardService } from '../services/AdaptiveCardService';
import { CommandParser } from '../utils/CommandParser';
import type { CreateSDRRequest } from '../types/sdr.types';

export class SDRBot extends TeamsActivityHandler {
  private sdrService: SDRService;
  private cardService: AdaptiveCardService;
  private commandParser: CommandParser;

  constructor() {
    super();
    this.sdrService = new SDRService();
    this.cardService = new AdaptiveCardService();
    this.commandParser = new CommandParser();

    // Handle messages
    this.onMessage(async (context, next) => {
      await this.handleMessage(context);
      await next();
    });

    // Handle members added
    this.onMembersAdded(async (context, next) => {
      const welcomeText = 'Welcome to the SDR Management Bot! Type "help" to see available commands.';
      for (const member of context.activity.membersAdded) {
        if (member.id !== context.activity.recipient.id) {
          const welcomeMessage = MessageFactory.text(welcomeText);
          await context.sendActivity(welcomeMessage);
        }
      }
      await next();
    });

    // Handle adaptive card submissions
    this.onMessageReaction(async (context, next) => {
      // Handle reactions to messages
      await next();
    });
  }

  private async handleMessage(context: TurnContext): Promise<void> {
    const text = context.activity.text?.toLowerCase().trim() || '';
    
    // Parse command
    const command = this.commandParser.parse(text);
    
    switch (command.action) {
      case 'help':
        await this.sendHelpMessage(context);
        break;
        
      case 'create':
        await this.handleCreateSDR(context, command.params);
        break;
        
      case 'list':
        await this.handleListSDRs(context, command.params);
        break;
        
      case 'status':
        await this.handleSDRStatus(context, command.params);
        break;
        
      case 'assign':
        await this.handleAssignSDR(context, command.params);
        break;
        
      default:
        // Check if message contains SDR-related keywords
        if (this.containsSDRKeywords(text)) {
          await this.suggestSDRCreation(context);
        } else {
          await this.sendUnknownCommandMessage(context);
        }
    }
  }

  private async sendHelpMessage(context: TurnContext): Promise<void> {
    const helpCard = this.cardService.createHelpCard();
    const message = MessageFactory.attachment(CardFactory.adaptiveCard(helpCard));
    await context.sendActivity(message);
  }

  private async handleCreateSDR(context: TurnContext, params: Record<string, string>): Promise<void> {
    try {
      // Get user information
      const member = await TeamsInfo.getMember(context, context.activity.from.id);
      
      if (params.interactive !== 'false') {
        // Send interactive form
        const createCard = this.cardService.createSDRFormCard();
        const message = MessageFactory.attachment(CardFactory.adaptiveCard(createCard));
        await context.sendActivity(message);
      } else {
        // Quick create from text
        const sdrData: CreateSDRRequest = {
          title: params.title || 'Quick SDR',
          description: params.description || context.activity.text,
          priority: (params.priority as any) || 'Medium',
          customerType: (params.customerType as any) || 'Internal',
          submitterId: member.id,
          submitterName: member.name,
          submitterEmail: member.email || `${member.name}@company.com`,
          sourceType: 'Teams'
        };

        const createdSDR = await this.sdrService.createSDR(sdrData);
        const successCard = this.cardService.createSDRCreatedCard(createdSDR);
        const message = MessageFactory.attachment(CardFactory.adaptiveCard(successCard));
        await context.sendActivity(message);
      }
    } catch (error) {
      console.error('Error creating SDR:', error);
      await context.sendActivity('Sorry, I encountered an error while creating the SDR. Please try again.');
    }
  }

  private async handleListSDRs(context: TurnContext, params: Record<string, string>): Promise<void> {
    try {
      const member = await TeamsInfo.getMember(context, context.activity.from.id);
      const filter = params.filter || 'mine';
      
      const sdrs = await this.sdrService.getSDRs({
        submitterId: filter === 'mine' ? member.id : undefined,
        status: params.status as any,
        limit: parseInt(params.limit) || 10
      });

      const listCard = this.cardService.createSDRListCard(sdrs);
      const message = MessageFactory.attachment(CardFactory.adaptiveCard(listCard));
      await context.sendActivity(message);
    } catch (error) {
      console.error('Error listing SDRs:', error);
      await context.sendActivity('Sorry, I encountered an error while fetching SDRs.');
    }
  }

  private async handleSDRStatus(context: TurnContext, params: Record<string, string>): Promise<void> {
    try {
      const sdrId = parseInt(params.id);
      if (!sdrId) {
        await context.sendActivity('Please provide a valid SDR ID. Example: "status 123"');
        return;
      }

      const sdr = await this.sdrService.getSDR(sdrId);
      const statusCard = this.cardService.createSDRStatusCard(sdr);
      const message = MessageFactory.attachment(CardFactory.adaptiveCard(statusCard));
      await context.sendActivity(message);
    } catch (error) {
      console.error('Error getting SDR status:', error);
      await context.sendActivity('Sorry, I could not find that SDR or encountered an error.');
    }
  }

  private async handleAssignSDR(context: TurnContext, params: Record<string, string>): Promise<void> {
    try {
      const sdrId = parseInt(params.id);
      const assignee = params.assignee;
      
      if (!sdrId || !assignee) {
        await context.sendActivity('Please provide both SDR ID and assignee. Example: "assign 123 john.doe@company.com"');
        return;
      }

      await this.sdrService.updateSDR(sdrId, { assignedTo: assignee });
      await context.sendActivity(`SDR ${sdrId} has been assigned to ${assignee}.`);
    } catch (error) {
      console.error('Error assigning SDR:', error);
      await context.sendActivity('Sorry, I encountered an error while assigning the SDR.');
    }
  }

  private containsSDRKeywords(text: string): boolean {
    const keywords = ['request', 'change', 'bug', 'feature', 'issue', 'problem', 'enhancement'];
    return keywords.some(keyword => text.includes(keyword));
  }

  private async suggestSDRCreation(context: TurnContext): Promise<void> {
    const suggestionCard = this.cardService.createSDRSuggestionCard();
    const message = MessageFactory.attachment(CardFactory.adaptiveCard(suggestionCard));
    await context.sendActivity(message);
  }

  private async sendUnknownCommandMessage(context: TurnContext): Promise<void> {
    await context.sendActivity('I didn\'t understand that command. Type "help" to see what I can do!');
  }
}