import NetworkPage from '../super/NetworkPage';

export default function AdminNetworkPage() {
  return <NetworkPage apiPrefix="/admin" resultsPath="/admin/results" />;
}
