import './Loading.css'

/**
 * Loading spinner component
 */
export const Loading = () => {
  return (
    <div className="loading">
      <div className="loading-spinner"></div>
      <div className="loading-text">Loading...</div>
    </div>
  )
}
