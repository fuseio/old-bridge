import { ApolloClient, InMemoryCache } from '@apollo/client'
import { LocalStorageWrapper, persistCacheSync } from 'apollo3-cache-persist'

// subgraph details https://www.notion.so/Subgraphs-4549b5239a014ce683e7dd378d2729c3
const VOLTAGE_SUBGRAPH_URL = process.env.REACT_APP_VOLTAGE_SUBGRAPH_URL
const VOLTAGE_SUBGRAPH_URL_V2 = process.env.REACT_APP_VOLTAGE_V2_SUBGRAPH_URL
const VOLTAGE_SUBGRAPH_URL_V3 = process.env.REACT_APP_VOLTAGE_V3_SUBGRAPH_URL
const FUSD_SUBGRAPH_URL = process.env.REACT_APP_FUSD_SUBGRAPH_URL
const FUSD_V3_SUBGRAPH_URL = process.env.REACT_APP_FUSD_V3_SUBGRAPH_URL
const VOLT_MAKER_V3_SUBGRAPH_URL = process.env.REACT_APP_VOLT_MAKER_V3_SUBGRAPH_URL
const MASTERCHEF_V3_SUBGRAPH_URL = process.env.REACT_APP_MASTERCHEF_V3_SUBGRAPH_URL
const MASTERCHEF_V4_SUBGRAPH_URL = process.env.REACT_APP_MASTERCHEF_V4_SUBGRAPH_URL
const FUSE_LIQUID_STAKING_SUBGRAPH_URL = process.env.REACT_APP_FUSE_LIQUID_STAKING_SUBGRAPH_URL
const VOLT_BAR_SUBGRAPH_URL = process.env.REACT_APP_VOLT_BAR_SUBGRAPH_URL
const VEVOLT_SUBGRAPH_URL = process.env.REACT_APP_VEVOLT_SUBGRAPH_URL
const PEGSWAP_SUBGRAPH_URL = process.env.REACT_APP_PEGSWAP_SUBGRAPH_URL
const FUSE_BLOCKS_SUBGRAPH_URL = process.env.REACT_APP_FUSE_BLOCKS_SUBGRAPH_URL
const FUSESWAP_SUBGRAPH_URL = process.env.REACT_APP_FUSESWAP_SUBGRAPH_URL
const VOLT_HOLDERS_SUBGRAPH_URL = process.env.REACT_APP_VOLT_HOLDERS_SUBGRAPH_URL
const STABLESWAP_SUBGRAPH_URL = process.env.REACT_APP_STABLESWAP_SUBGRAPH_URL 
const ETH_FUSE_AMB_SUBGRAPH_URL = process.env.REACT_APP_ETH_FUSE_AMB_SUBGRAPH_URL
const FUSE_ETH_AMB_SUBGRAPH_URL = process.env.REACT_APP_FUSE_ETH_AMB_SUBGRAPH_URL
const FUSE_ETH_NATIVE_BRIDGE_SUBGRAPH_URL = process.env.REACT_APP_FUSE_ETH_NATIVE_BRIDGE_SUBGRAPH_URL
const ETH_FUSE_NATIVE_BRIDGE_SUBGRAPH_URL = process.env.REACT_APP_ETH_FUSE_NATIVE_BRIDGE_SUBGRAPH_URL

const cache = new InMemoryCache()

persistCacheSync({
  cache,
  storage: new LocalStorageWrapper(window.localStorage),
})

export const fuseswapSubgraphClient = new ApolloClient({
  uri: FUSESWAP_SUBGRAPH_URL,
  cache: new InMemoryCache(),
})

export const voltageSubgraphClient = new ApolloClient({
  uri: VOLTAGE_SUBGRAPH_URL,
  cache: new InMemoryCache(),
})

export const voltageSubgraphV2Client = new ApolloClient({
  uri: VOLTAGE_SUBGRAPH_URL_V2,
  cache: new InMemoryCache(),
})

export const voltageSubgraphV3Client = new ApolloClient({
  uri: VOLTAGE_SUBGRAPH_URL_V3,
  cache: new InMemoryCache(),
})
export const stableswapSubgraphClient = new ApolloClient({
  uri: STABLESWAP_SUBGRAPH_URL,
  cache: new InMemoryCache(),
})

export const ethFuseAmbSubgraphClient = new ApolloClient({
  uri: ETH_FUSE_AMB_SUBGRAPH_URL,
  cache: new InMemoryCache(),
})

export const fuseEthAmbSubgraphClient = new ApolloClient({
  uri: FUSE_ETH_AMB_SUBGRAPH_URL,
  cache: new InMemoryCache(),
})

export const fuseEthNativeSubgraphClient = new ApolloClient({
  uri: FUSE_ETH_NATIVE_BRIDGE_SUBGRAPH_URL,
  cache: new InMemoryCache(),
})

export const ethFuseNativeSubgraphClient = new ApolloClient({
  uri: ETH_FUSE_NATIVE_BRIDGE_SUBGRAPH_URL,
  cache: new InMemoryCache(),
})

export const masterChefV3Client = new ApolloClient({
  uri: MASTERCHEF_V3_SUBGRAPH_URL,
  cache,
})

export const masterChefV4Client = new ApolloClient({
  uri: MASTERCHEF_V4_SUBGRAPH_URL,
  cache,
})

export const clientVoltTokenHolders = new ApolloClient({
  uri: VOLT_HOLDERS_SUBGRAPH_URL,
  cache: new InMemoryCache(),
})

export const blockClient = new ApolloClient({
  uri: FUSE_BLOCKS_SUBGRAPH_URL,
  cache: new InMemoryCache(),
})

export const fusdClient = new ApolloClient({
  uri: FUSD_SUBGRAPH_URL,
  cache: new InMemoryCache(),
})

export const fusdClientV3 = new ApolloClient({
  uri: FUSD_V3_SUBGRAPH_URL,
  cache: new InMemoryCache(),
})

export const voltBarClient = new ApolloClient({
  uri: VOLT_BAR_SUBGRAPH_URL,
  cache: new InMemoryCache(),
})

export const clientVeVoltStakeHolders = new ApolloClient({
  uri: VOLT_MAKER_V3_SUBGRAPH_URL,
  cache: new InMemoryCache(),
})

export const fuseLiquidStakingClient = new ApolloClient({
  uri: FUSE_LIQUID_STAKING_SUBGRAPH_URL,
  cache: new InMemoryCache(),
})

export const voltBarStakingClient = new ApolloClient({
  uri: VOLT_BAR_SUBGRAPH_URL,
  cache: new InMemoryCache(),
})

export const vevoltClient = new ApolloClient({
  uri: VEVOLT_SUBGRAPH_URL,
  cache: new InMemoryCache(),
})

export const pegswapClient = new ApolloClient({
  uri: PEGSWAP_SUBGRAPH_URL,
  cache: new InMemoryCache(),
})
