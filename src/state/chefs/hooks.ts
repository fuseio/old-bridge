import useSWR from 'swr'
import { getMasterChefV3Pool } from '../../graphql/queries'

export enum Chef {
  MASTERCHEF_V2,
  MASTERCHEF_V3
}

export function useChefV3Pool(pid?: string) {
  const { data } = useSWR(pid ? ['masterChefV3Pool', pid] : null, (_, pid) => getMasterChefV3Pool(pid))
  if (!data) return
  return { ...data, type: 'chef', chef: Chef.MASTERCHEF_V3 }
}
