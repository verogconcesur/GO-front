export default interface SwitchboardDataCall {
  agent_id: string;
  application_id: string;
  application_name: string;
  call_id: string;
  client: string;
  duration: string;
  extension: string;
  external: boolean;
  from: string;
  id: string;
  is_internal: boolean;
  queue_id: string;
  queue_name: string;
  service_id: string;
  service_name: string;
  state: string;
  time: string;
  time_start: string;
  to: string;
  type: string;
}
