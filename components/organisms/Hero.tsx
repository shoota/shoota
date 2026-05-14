import { Hero as HeroComponent } from '@/components/blog/hero'

const Hero = () => {
  return (
    <HeroComponent
      cover='Leap before you look.'
      size='lg'
      imgProps={{ src: '/assets/img/run.jpg', alt: 'Leap before you look.' }}
    />
  )
}

export default Hero
