interface LoadingScreenProps {
  message: string;
}

export default function LoadingScreen({ message }: LoadingScreenProps) {
  return (
    <div className="loading-container">
      <p className="text">{message}</p>
      <div className="loading-bar" />
    </div>
  );
}
