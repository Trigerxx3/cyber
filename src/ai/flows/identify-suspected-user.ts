'use server';
/**
 * @fileOverview Performs OSINT-like analysis on a given username to identify potential linked profiles and assess risk.
 *
 * - identifySuspectedUser - A function that handles the user identification process.
 * - IdentifySuspectedUserInput - The input type for the identifySuspectedUser function.
 * - IdentifySuspectedUserOutput - The return type for the identifySuspectedUser function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifySuspectedUserInputSchema = z.object({
  username: z.string().describe('The username to investigate.'),
  platform: z
    .enum(['Telegram', 'WhatsApp', 'Instagram'])
    .describe('The social media platform the username is from.'),
});
export type IdentifySuspectedUserInput = z.infer<typeof IdentifySuspectedUserInputSchema>;

const IdentifySuspectedUserOutputSchema = z.object({
  linkedProfiles: z
    .array(z.string())
    .describe(
      'A list of potential linked profiles on other platforms, in the format "platform:username".'
    ),
  email: z.string().optional().describe('A potential email address associated with the user.'),
  riskLevel: z
    .enum(['Low', 'Medium', 'High', 'Critical'])
    .describe('The assessed risk level of the user based on the OSINT analysis.'),
  summary: z.string().describe('A brief summary of the findings and reasoning for the risk assessment.'),
});
export type IdentifySuspectedUserOutput = z.infer<typeof IdentifySuspectedUserOutputSchema>;

export async function identifySuspectedUser(input: IdentifySuspectedUserInput): Promise<IdentifySuspectedUserOutput> {
  return identifySuspectedUserFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifySuspectedUserPrompt',
  input: {schema: IdentifySuspectedUserInputSchema},
  output: {schema: IdentifySuspectedUserOutputSchema},
  prompt: `You are an expert OSINT (Open-Source Intelligence) analyst specializing in tracking illicit activities online.

  A user has been flagged for suspicious activity. Your task is to perform a simulated OSINT analysis on the provided username and platform.
  Based on the username, generate a list of plausible linked profiles on other platforms. For example, if the username is "drug_dealer123", a linked profile could be "Telegram:drug_dealer123_shop".
  Generate a potential email address if it seems plausible based on the username.
  Assess the user's risk level (Low, Medium, High, Critical) based on the username's characteristics and potential for illicit activities.
  Provide a summary explaining your findings and the rationale for the assigned risk level.

  Username: {{{username}}}
  Platform: {{{platform}}}
  `,
});

const identifySuspectedUserFlow = ai.defineFlow(
  {
    name: 'identifySuspectedUserFlow',
    inputSchema: IdentifySuspectedUserInputSchema,
    outputSchema: IdentifySuspectedUserOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
