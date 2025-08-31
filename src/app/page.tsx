import type { Metadata } from 'next'

import { DATA } from '@/config/data'
import Home from '@/components/home'

export const metadata: Metadata = {
  title: DATA.name
}

const HomeServer = () => <Home />

export default HomeServer
