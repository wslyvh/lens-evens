import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'

interface Props {
  onFileUpload: (file: File) => void
}

export function FileUpload(props: Props) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      console.log('handleFileUpload', acceptedFiles)

      if (acceptedFiles?.length > 0) {
        const file = acceptedFiles[0]
        props.onFileUpload(file)
      }
    },
    [props]
  )

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'image/png': ['.png'],
    },
  })

  return (
    <div className='flex items-center justify-center w-full' {...getRootProps()}>
      <label
        htmlFor='dropzone-file'
        className='flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-900 hover:bg-gray-800 border-gray-600'>
        <div className='flex flex-col items-center justify-center pt-5 pb-6'>
          <svg
            className='w-8 h-8 mb-4 text-gray-500 dark:text-gray-400'
            aria-hidden='true'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 20 16'>
            <path
              stroke='currentColor'
              stroke-linecap='round'
              stroke-linejoin='round'
              stroke-width='2'
              d='M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2'
            />
          </svg>
          <p className='mb-2 text-sm text-gray-500 dark:text-gray-400'>
            <span className='font-semibold'>Click to upload</span> or drag and drop
          </p>
          <p className='text-xs text-gray-500 dark:text-gray-400'>
            .png format, with a recommended size of 1200:600 (2:1 ratio)
          </p>
        </div>
        <input id='dropzone-file' {...getInputProps()} />
      </label>
    </div>
  )
}
