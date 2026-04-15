import type { BrokerInfo } from '@/types/broker';
import type { TranslateFn } from '@/shared/i18n';
import { currentRegionConfig } from '@/shared/config/region';

function linkify(text: string, url: string): React.ReactNode {
  const idx = text.indexOf(url);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <a href={`https://${url}`} target="_blank" rel="noopener noreferrer">
        {url}
      </a>
      {text.slice(idx + url.length)}
    </>
  );
}

/**
 * Available brokers for selection
 * Each broker has its own credential field configuration
 * Must be called from component scope where `t` is available
 */
export function getAvailableBrokers(t: TranslateFn): BrokerInfo[] {
  const regionBrokers = currentRegionConfig.brokers as readonly string[];

  return (
    [
      {
        type: 'finam',
        name: t('metadata.finam'),
        url: 'tradeapi.finam.ru/getting-started/',
        icon: 'finam',
        enabled: true,
        connectionType: 'token',
        credentialFields: [
          {
            name: 'secret',
            label: t('constants.apiTokenLabel'),
            type: 'password',
            placeholder: t('constants.apiTokenPlaceholder'),
            required: true,
            useTextArea: true,
          },
        ],
        howToDoDescription: linkify(
          t('constants.finamHowToDoDesc'),
          'tradeapi.finam.ru'
        ),
        notClientDescription: linkify(
          t('constants.finamNotClientDesc'),
          'finam.ru'
        ),
        tokenManual: {
          parts: [
            {
              title: t('constants.finamManualTitle'),
              subtitle: t('tokenInstruction.partOne'),
              steps: [
                t('constants.finamManualSteps.step1'),
                t('constants.finamManualSteps.step2'),
                t('constants.finamManualSteps.step3'),
                t('constants.finamManualSteps.step4'),
              ],
            },
            {
              title: t('constants.finamManualTitle'),
              subtitle: t('tokenInstruction.partTwo'),
              steps: [
                t('constants.finamManualSteps.step6'),
                t('constants.finamManualSteps.step7'),
                t('constants.finamManualSteps.step8'),
                t('constants.finamManualSteps.step9'),
                t('constants.finamManualSteps.step10'),
              ],
            },
          ],
        },
      },
      {
        type: 't-invest',
        name: t('metadata.t-invest'),
        url: 'www.tbank.ru/invest/settings/',
        icon: 't-invest',
        enabled: true,
        connectionType: 'token',
        credentialFields: [
          {
            name: 'token',
            label: t('constants.apiTokenLabel'),
            type: 'password',
            placeholder: t('constants.tInvestTokenPlaceholder'),
            required: true,
            useTextArea: true,
          },
        ],
        howToDoDescription: t('constants.tInvestHowToDoDesc'),
        notClientDescription: t('constants.tInvestNotClientDesc'),
        tokenManual: {
          parts: [
            {
              title: t('constants.tInvestManualTitle'),
              steps: [
                t('constants.tInvestManualSteps.step1'),
                linkify(
                  t('constants.tInvestManualSteps.step2'),
                  'tbank.ru/invest/settings/'
                ),
                t('constants.tInvestManualSteps.step3'),
                t('constants.tInvestManualSteps.step4'),
                t('constants.tInvestManualSteps.step5'),
              ],
            },
          ],
        },
      },
      {
        type: 'bybit',
        name: t('metadata.bybit'),
        url: 'www.bybit.com',
        icon: 'bybit',
        enabled: true,
        connectionType: 'token',
        credentialFields: [
          {
            name: 'apiKey',
            label: t('constants.bybitApiKeyLabel'),
            type: 'password',
            placeholder: t('constants.bybitApiKeyPlaceholder'),
            required: true,
            helpText: t('constants.bybitApiKeyHelp'),
          },
          {
            name: 'apiSecret',
            label: t('constants.bybitApiSecretLabel'),
            type: 'password',
            placeholder: t('constants.bybitApiSecretPlaceholder'),
            required: true,
          },
        ],
        howToDoDescription: t('constants.bybitHowToDoDesc'),
        notClientDescription: t('constants.bybitNotClientDesc'),
        tokenManual: {
          parts: [
            {
              title: t('constants.bybitManualTitle'),
              subtitle: t('tokenInstruction.partOne'),
              steps: [
                t('constants.bybitManualSteps.step1'),
                t('constants.bybitManualSteps.step2'),
                t('constants.bybitManualSteps.step3'),
              ],
            },
            {
              title: t('constants.bybitManualTitle'),
              subtitle: t('tokenInstruction.partTwo'),
              steps: [
                t('constants.bybitManualSteps.step4'),
                t('constants.bybitManualSteps.step5'),
                t('constants.bybitManualSteps.step6'),
              ],
            },
          ],
        },
      },
      {
        type: 'kucoin',
        name: t('metadata.kucoin'),
        url: 'www.kucoin.com',
        icon: 'kucoin',
        enabled: true,
        connectionType: 'token',
        credentialFields: [
          {
            name: 'apiKey',
            label: t('constants.kucoinApiKeyLabel'),
            type: 'password',
            placeholder: t('constants.kucoinApiKeyPlaceholder'),
            required: true,
          },
          {
            name: 'apiSecret',
            label: t('constants.kucoinApiSecretLabel'),
            type: 'password',
            placeholder: t('constants.kucoinApiSecretPlaceholder'),
            required: true,
          },
          {
            name: 'passphrase',
            label: t('constants.kucoinPassphraseLabel'),
            type: 'password',
            placeholder: t('constants.kucoinPassphrasePlaceholder'),
            required: true,
            helpText: t('constants.kucoinPassphraseHelp'),
          },
        ],
        howToDoDescription: linkify(
          t('constants.kucoinManualTitle'),
          'kucoin.com'
        ),
        tokenManual: {
          parts: [
            {
              title: t('constants.kucoinManualTitle'),
              steps: [
                t('constants.kucoinManualSteps.step1'),
                t('constants.kucoinManualSteps.step2'),
                t('constants.kucoinManualSteps.step3'),
                t('constants.kucoinManualSteps.step4'),
                t('constants.kucoinManualSteps.step5'),
                t('constants.kucoinManualSteps.step6'),
              ],
            },
          ],
        },
      },
      {
        type: 'snaptrade',
        name: t('metadata.snaptrade'),
        url: 'snaptrade.com',
        icon: 'snaptrade',
        enabled: true,
        connectionType: 'portal',
        credentialFields: [],
        tokenManual: null,
      },
    ] as BrokerInfo[]
  ).filter((b) => regionBrokers.includes(b.type));
}
