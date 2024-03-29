import { goerli, mainnet } from '@starknet-react/chains'
import { argent, braavos, publicProvider, StarknetConfig, starkscan, useInjectedConnectors } from '@starknet-react/core'
// import { WebWalletConnector } from 'starknetkit/dist/connectors/webwallet'
// import { ArgentMobileConnector } from 'starknetkit/dist/connectors/argentMobile'

const network = process.env.REACT_APP_NETWORK ?? 'goerli'
// STARKNET
interface StarknetProviderProps {
  children: React.ReactNode
}

export function StarknetProvider({ children }: StarknetProviderProps) {
  const { connectors: injected } = useInjectedConnectors({
    recommended: [argent(), braavos()],
    includeRecommended: 'always',
  })
  const connectors = [
    ...injected,
    // new WebWalletConnector({ url: 'https://web.argent.xyz' }),
    // new ArgentMobileConnector(),
  ]

  return (
    <StarknetConfig
      connectors={connectors}
      chains={[network === 'mainnet' ? mainnet : goerli]}
      provider={publicProvider()}
      explorer={starkscan}
      autoConnect
    >
      {children}
    </StarknetConfig>
  )
}