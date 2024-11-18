import { Token } from '@voltage-finance/sdk-core'
import { ChainId } from './chains'

export const VOLT_ADDRESS: any = {
  [ChainId.SPARK]: '0x739E7349f09351EAd1234aaaD263D86De6b3192D',
  [ChainId.FUSE]: '0x34Ef2Cc892a88415e9f02b91BfA9c91fC0bE6bD4',
}

export const VOLT: any = {
  [ChainId.SPARK]: new Token(ChainId.SPARK, VOLT_ADDRESS[ChainId.SPARK], 18, 'VOLT', 'Volt'),
  [ChainId.FUSE]: new Token(ChainId.FUSE, VOLT_ADDRESS[ChainId.FUSE], 18, 'VOLT', 'Volt'),
}

export const VEVOLT_ADDRESS: any = {
  [ChainId.SPARK]: '0x0fa0291e142325Ad4f72680a4b55CbD7c41986b1',
  [ChainId.FUSE]: '0xB0a05314Bd77808269e2E1E3D280Bff57Ba85672',
}

export const VEVOLT: any = {
  [ChainId.SPARK]: new Token(ChainId.SPARK, VEVOLT_ADDRESS[ChainId.SPARK], 18, 'veVolt', 'Vote-escrowed VOLT'),
  [ChainId.FUSE]: new Token(ChainId.FUSE, VEVOLT_ADDRESS[ChainId.FUSE], 18, 'veVolt', 'Vote-escrowed VOLT'),
}

export const FEE_DISTRIBUTOR_ADDRESS: any = {
  [ChainId.SPARK]: '0x4071213F22eAfB340d6De1f684987C68010f9448',
  [ChainId.FUSE]: '0xC6A00C7fE6D01CA18c29a4F7e4F5d76fF7b83751',
}

export const NFT_POSITION_MANAGER_ADDRESS: any = {
  [ChainId.FUSE]: '0x1613CD7C55A107d3664D74ffF18AA47429910743'
}

export const MASTERCHEF_V4_ADDRESS: any = {
  [ChainId.FUSE]: '0x62b911f76fb7a54C25f4105c7da1D70052AE8596'
}

export const FEE_ON_TRANSFER_DETECTOR_ADDRESS = {
  [ChainId.FUSE]: '0x68A88024060fD8Fe4dE848de1abB7F6d9225cCa8'
}
