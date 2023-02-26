'use client'

import dynamic from 'next/dynamic'

export default dynamic(() => import('./player'))

export { OpenInPlayers } from './open-in'
