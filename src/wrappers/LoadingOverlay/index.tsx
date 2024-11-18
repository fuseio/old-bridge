import { Box } from 'rebass/styled-components'
import Loader from '../../components/Loaders/default'
import NoSelect from '../NoSelect'

export const LoadingOverlay = ({ loading, children }: { loading: boolean; children: any }) => {
  if (loading) {
    return (
      <NoSelect>
        <Box
          sx={{
            opacity: 0.5,
            display: 'block',
            position: 'relative',
            pointerEvents: 'none',
          }}
        >
          {
            <Box
              sx={{
                position: 'absolute',
                top: '45%',
                left: '50%',
                zIndex: 9999,
                transform: 'translate(-50%,-50%)',
              }}
            >
              <Loader size={30} />
            </Box>
          }
          {children}
        </Box>
      </NoSelect>
    )
  }
  return children
}
