const bytesToMB = (bytes: number) => {
  // 1 MB = 1024 KB, 1 KB = 1024 bytes
  const megabytes = bytes / (1024 * 1024)
  const roundedMB = Math.round(megabytes * 10) / 10

  return roundedMB
}

export { bytesToMB }
