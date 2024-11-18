import { ChainId, Currency, Ether, NativeCurrency, Token, WETH9 } from '@voltage-finance/sdk-core'

export const WRAPPED_NATIVE_CURRENCY: { [chainId: number]: Token | undefined } = {
  ...(WETH9 as Record<ChainId, Token>),
}

class ExtendedEther extends Ether {
  public get wrapped(): Token {
    const wrapped = WRAPPED_NATIVE_CURRENCY[this.chainId]
    if (wrapped) return wrapped
    throw new Error(`Unsupported chain ID: ${this.chainId}`)
  }

  private static _cachedExtendedEther: { [chainId: number]: NativeCurrency } = {}

  public static onChain(chainId: number): ExtendedEther {
    return this._cachedExtendedEther[chainId] ?? (this._cachedExtendedEther[chainId] = new ExtendedEther(chainId))
  }
}

export function isBsc(chainId: number): chainId is ChainId.BNB {
  return chainId === ChainId.BNB
}

class BscNativeCurrency extends NativeCurrency {
  equals(other: Currency): boolean {
    return other.isNative && other.chainId === this.chainId
  }

  get wrapped(): Token {
    if (!isBsc(this.chainId)) throw new Error('Not bnb')
    const wrapped = WRAPPED_NATIVE_CURRENCY[this.chainId]
    return wrapped
  }

  public constructor(chainId: number) {
    if (!isBsc(chainId)) throw new Error('Not bnb')
    super(chainId, 18, 'BNB', 'BNB')
  }
}

export function isFuse(chainId: number): chainId is ChainId.FUSE {
  return chainId === ChainId.FUSE
}

class FuseNativeCurrency extends NativeCurrency {
  equals(other: Currency): boolean {
    return other.isNative && other.chainId === this.chainId
  }

  get wrapped(): Token {
    if (!isFuse) throw new Error('Not fuse')
    const wrapped = WRAPPED_NATIVE_CURRENCY[this.chainId]
    return wrapped
  }

  public constructor(chainId: number) {
    if (!isFuse(chainId)) throw new Error('Not fuse')
    super(chainId, 18, 'FUSE', 'FUSE')
  }
}

const cachedNativeCurrency: { [chainId: number]: NativeCurrency | Token } = {}
export function nativeOnChain(chainId: number): NativeCurrency | Token {
  if (cachedNativeCurrency[chainId]) return cachedNativeCurrency[chainId]
  let nativeCurrency: NativeCurrency | Token
  if (isFuse(chainId)) {
    nativeCurrency = new FuseNativeCurrency(chainId)
  } else if (isBsc(chainId)) {
    nativeCurrency = new BscNativeCurrency(chainId)
  } else {
    nativeCurrency = ExtendedEther.onChain(chainId)
  }
  return (cachedNativeCurrency[chainId] = nativeCurrency)
}
