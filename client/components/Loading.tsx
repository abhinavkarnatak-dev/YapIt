import React from 'react'

const Loading = () => {
  return (
    <div className='flex items-center justify-center h-screen bg-surface text-on-surface'>
        <div className='flex items-center gap-2'>
            <div className='w-4 h-4 bg-primary rounded-full animate-bounce'></div>
            <div className='w-4 h-4 bg-primary rounded-full animate-bounce delay-100'></div>
            <div className='w-4 h-4 bg-primary rounded-full animate-bounce delay-200'></div>
        </div>
    </div>
  )
}

export default Loading