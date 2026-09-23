import { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import { I18nProvider } from './i18n'
import '@nutui/nutui-react-taro/dist/style.css'
import './app.scss'

function App ({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    console.log('App launched.')
  })

  return <I18nProvider>{children}</I18nProvider>
}

export default App
