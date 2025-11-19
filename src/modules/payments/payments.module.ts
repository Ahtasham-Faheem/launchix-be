import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StripeService } from './services/stripe.service';
import { PlansService } from './services/plans.service';
import { WebhookService } from './services/webhook.service';
import { StripeController } from './controllers/stripe.controller';
import { PlansController } from './controllers/plans.controller';
import { WebhookController } from './controllers/webhook.controller';
import { EmailService } from '../email/email.service';
import { User, UserSchema } from 'src/schemas/user.schema';
import { Plan, PlanSchema } from 'src/schemas/plan.schema';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Plan.name, schema: PlanSchema },
    ]),
  ],
  controllers: [StripeController, PlansController, WebhookController],
  providers: [StripeService, PlansService, WebhookService, EmailService],
  exports: [StripeService, PlansService, MongooseModule],
})
export class PaymentsModule {}
