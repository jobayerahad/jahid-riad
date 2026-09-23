'use client'

import { ActionIcon, useComputedColorScheme, useMantineColorScheme } from '@mantine/core'
import { HiOutlineMoon, HiOutlineSun } from 'react-icons/hi2'

const ColorSchemeToggle = () => {
  const { setColorScheme } = useMantineColorScheme()
  const computed = useComputedColorScheme('light', { getInitialValueInEffect: true })
  const next = computed === 'dark' ? 'light' : 'dark'

  return (
    <ActionIcon
      variant="subtle"
      size="lg"
      aria-label={`Switch to ${next} mode`}
      onClick={() => setColorScheme(next)}
    >
      {computed === 'dark' ? <HiOutlineSun aria-hidden="true" /> : <HiOutlineMoon aria-hidden="true" />}
    </ActionIcon>
  )
}

export default ColorSchemeToggle
