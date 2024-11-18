export const useFarmPositionPrice = (farm) => {
  const parsedTotalStaked = parseInt(farm.totalStaked) / 1e18

  if (farm?.totalStaked && farm?.pairPrice) {
    return farm?.pairPrice * parsedTotalStaked
  }
}
