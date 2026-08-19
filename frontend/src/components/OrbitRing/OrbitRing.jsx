import ringImage from '../../assets/images/빙글빙글 원.svg'
import './OrbitRing.css'

function OrbitRing() {
  return (
    <div className="orbit-ring" aria-hidden="true">
      <img src={ringImage} className="orbit-ring__image" alt="" />
      <div className="orbit-ring__orbit orbit-ring__orbit--outer">
        <span className="orbit-ring__spark" />
      </div>
      <div className="orbit-ring__orbit orbit-ring__orbit--inner">
        <span className="orbit-ring__spark" />
      </div>
    </div>
  )
}

export default OrbitRing
