import React, {Fragment} from 'react'
import blessed from 'blessed'
import { render } from 'react-blessed'
import Today from './components/Today'

const App = () => {
  return (
    <Fragment>
      <Today top={1} left={1} width='50%' height='50%' updateInterval={900000} />
      <Box></Box>
    </Fragment>
  )
}

const screen = blessed.screen({
  autoPadding: true,
  smartCSR: true,
  title: 'Developer Dashboard'
})

screen.key(['escape', 'q', 'C-c'], () => process.exit(0))

render(<App />, screen)
