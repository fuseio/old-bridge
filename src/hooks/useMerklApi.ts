import axios from 'axios'

export const MERKL_BASE_URL = 'https://api.merkl.xyz'
export const MERKL_DISTRIBUTOR_ADDRESS = '0x3Ef3D8bA38EBe18DB133cEc108f4D14CE00Dd9Ae'

export interface CampaignResponseType {
    [key: string]: {
        [key: string]: {
            chainId: number,
            index: number,
            campaignId: string,
            creator: string,
            campaignType: number,
            campaignSubType: number,
            rewardToken: string,
            amount: string,
            amountDecimal: string,
            startTimestamp: number,
            endTimestamp: number,
            mainParameter: string,
            campaignParameters: {
                url: string,
                jsonUrl: string,
                forwarders: string[],
                symbolRewardToken: string,
                decimalsRewardToken: number
            },
            computeChainId: number,
            tags: string[]
        }
    }
}

export interface CampaignType {
    chainId: number,
    index: number,
    campaignId: string,
    creator: string,
    campaignType: number,
    campaignSubType: number,
    rewardToken: string,
    amount: string,
    amountDecimal: string,
    startTimestamp: number,
    endTimestamp: number,
    mainParameter: string,
    campaignParameters: {
        url: string,
        jsonUrl: string,
        forwarders: string[],
        symbolRewardToken: string,
        decimalsRewardToken: number
    },
    computeChainId: number,
    tags: string[]
}

export interface UserRewardsType {
    [chainId: number]: {
        tokenData: {
            [token: string]: {
                accumulated: string;
                unclaimed: string;
                decimals: number;
                symbol: string;
                proof: string[];
            }
        },
        campaignData: {
            [campaignId: string]: {
                [reason: string]: {
                    accumulated: string;
                    unclaimed: string;
                    token: string;
                    decimals: number;
                    symbol: string;
                    mainParameter: string;
                    auxiliaryData1: string;
                    auxiliaryData2: string;
                }
            }
        }
    }
}

export const getMerklPairs = async () => {
    try {
        const res: CampaignResponseType = (await axios.get(`${MERKL_BASE_URL}/v3/campaigns?chainIds=${122}`)).data['122']
        // eslint-disable-next-line prefer-const
        let formattedCampaigns = {}
        Object.keys(res).forEach((k) => {
            formattedCampaigns[k.split("_")[1].toLowerCase()] = Object.values(res[k]).sort((a, b) => a.endTimestamp - b.endTimestamp)
        })
        return formattedCampaigns
    }
    catch (e) {
        console.error(e)
        return {}
    }
}

export const claimUserMerklRewards = async (userAddress: string) => {
    try {
        const data = (await axios.get(`${MERKL_BASE_URL}/v3/userRewards?chainId=${122}&user=${userAddress}&proof=true`)).data
        return data
    }
    catch (e) {
        console.error(e)
        return {}
    }
}

export const getClaimable = async (poolAddress: string, userAddress: string) => {
    const res = await axios.get(`${MERKL_BASE_URL}/v3/userRewards?chainIds=${122}&user=${userAddress}&mainPapameter=${poolAddress}`)
    return res.data[userAddress]
}

export const getClaimableForAll = async (userAddress: string) => {
    try {
        const res = await axios.get(`${MERKL_BASE_URL}/v3/rewards?chainIds=${122}&user=${userAddress}`)
        const result = res.data as UserRewardsType
        return result[122]?.campaignData
    }
    catch (e) {
        console.error(e)
        return {}
    }
}