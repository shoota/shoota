import { Hero as HeroComponent } from 'gymnopedies'

const Hero = () => {
  return (
    <HeroComponent
      cover='Leap before you look.'
      size='lg'
      imgProps={{ src: '/assets/img/run.jpg' }}
    />
  )
}

export default Hero
