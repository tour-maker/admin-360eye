
function Logo({css,src}) {
  return (
    <img src={src} className={'   card  object-fill  w-[7%] h-[clamp(60px,6.5vw,6.5vw)] min-w-[60px] '+css} />
  )
}

export default Logo


