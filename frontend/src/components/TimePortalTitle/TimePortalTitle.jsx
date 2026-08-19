import './TimePortalTitle.css'

function TimePortalTitle({ className = '' }) {
  const classes = ['time-portal-title', className].filter(Boolean).join(' ')

  return (
    <h1 className={classes}>
      <span className="time-portal-title__time">TIME</span>
      <span className="time-portal-title__portal">PORTAL</span>
    </h1>
  )
}

export default TimePortalTitle
