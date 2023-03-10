import React from 'react'
import figlet from 'figlet'
import useInterval from '@use-it/interval'
import weather from 'weather-js'
import util from 'util'
import useDeepCompareEffect from 'use-deep-compare-effect'
import chalk from 'chalk'
import gradient from 'gradient-string'
import Box from './Box';

const findWeather = util.promisify(weather.find)

const FONTS = [
  'Straight',
  'ANSI Shadow',
  'Shimrod',
  'doom',
  'Big',
  'Ogre',
  'Small',
  'Standard',
  'Bigfig',
  'Mini',
  'Small Script',
  'Small Shadow'
]

const useRequest = (promise, options, interval = null) => {
  const [state, setState] = React.useState({
    status: 'loading',
    error: null,
    data: null
  })

  const request = React.useCallback(
    async options => {
      setState({ status: 'loading', error: null, data: null })
      let data
      try {
        data = await promise(options)
        setState({ status: 'complete', error: null, data })
      } catch (error) {
        setState({ status: 'error', error, data: null })
      }
    },
    [promise]
  )

  useDeepCompareEffect(() => {
    request(options)
  }, [options, request])

  useInterval(() => {
    request(options)
  }, interval)

  return state
}

const formatWeather = ([results]) => {
  const { location, current, forecast } = results
  const degreeType = location.degreetype
  const temperature = `${current.temperature}°${degreeType}`
  const conditions = current.skytext
  const low = `${forecast[1].low}°${degreeType}`
  const high = `${forecast[1].high}°${degreeType}`

  return `${chalk.yellow(temperature)} and ${chalk.green(
    conditions
  )} (${chalk.blue(low)} → ${chalk.red(high)})`
}

export default function Today({
  updateInterval = 900000,
  search = 'Nashville, TN',
  degreeType = 'F',
  top, left, width, height
}) {

  const boxProps = { top, left, width, height }
  const [fontIndex, setFontIndex] = React.useState(0)
  const [now, setNow] = React.useState(new Date())
  const weather = useRequest(
    findWeather,
    { search, degreeType },
    updateInterval
  )

  useInterval(() => {
    setNow(new Date())
  }, 60000) // 1 minute

  const date = now.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
  const time = figlet.textSync(
    now.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    {
      font: FONTS[fontIndex % FONTS.length]
    }
  )

  return (
    <Box
      label='Today'
      {...boxProps}
    >
      <text right={1}>
        ${chalk.blue(date)}
      </text>
      <text top='center' left='center'>
        ${gradient.atlas.multiline(time)}
      </text>
      <text top='100%-3' left={1}>
        ${weather.status === 'loading'
          ? 'Loading...'
          : weather.error
          ? `Error: ${weather.error}`
          : formatWeather(weather.data)
        }
      </text>
    </Box>
  )
}
