import { has } from 'lodash'
import { useEffect } from 'react'
import { toast } from 'react-toastify'
import { useActivePopups, useRemovePopup } from '../../state/application/hooks'
import DeprecatedPopup from './DeprecatedPopup'

import { Box } from 'rebass'
import ListUpdatePopup from './ListUpdatePopup'

export default function Popups() {
  const activePopups = useActivePopups()
  const removePopup = useRemovePopup()

  useEffect(() => {
    activePopups.forEach(({ key, content }) => {
      if (has(content, 'deprecated')) {
        toast(<DeprecatedPopup content={content} />, {
          position: 'bottom-right',
          toastId: key,
          autoClose: (content as any)?.removeAfterMs,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
          theme: 'light',
          onClose: () => {
            removePopup(key)
          },
        })
      }

      if (has(content, 'listUpdate')) {
        toast(<ListUpdatePopup toastId={key} content={content} />, {
          position: 'bottom-right',
          autoClose: false,
          toastId: key,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
          theme: 'light',
          onClose: () => {
            removePopup(key)
          },
        })
      }
    })
  }, [activePopups])

  return <Box></Box>
}
