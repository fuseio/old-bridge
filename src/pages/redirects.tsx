import { Redirect, RouteComponentProps } from 'react-router-dom'

export function RedirectToDefault(props: RouteComponentProps) {

  // TODO: use chainID to determine default path
  const path = '/home'

  return (
    <Redirect
      to={{
        ...props,
        pathname: path
      }}
    />
  )
}
