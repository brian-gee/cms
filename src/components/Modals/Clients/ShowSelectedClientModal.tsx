import { Show } from "solid-js";

export function ShowSelectedClientModal({
  selectedClient,
  setSelectedClient,
  formatPhoneNumber,
}) {
  return (
    <Show when={selectedClient()}>
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        aria-hidden="true"
      ></div>
      <div
        class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto"
        id="client-info-modal"
      >
        <div class="relative w-full h-full max-w-2xl px-4 md:h-auto">
          <div class="relative bg-white rounded-lg shadow ">
            <div class="flex items-start justify-between p-5 border-b rounded-t ">
              <h3 class="text-xl font-semibold ">Client Information</h3>
              <div>
                <button class="ml-auto text-indigo-600 hover:text-indigo-900">
                  Edit
                </button>
                <button
                  type="button"
                  class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center "
                  onClick={() => setSelectedClient(null)}
                >
                  <svg
                    class="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                </button>
              </div>
            </div>
            <div class="p-6 space-y-6">
              {/* Display client information here */}
              <div>
                <h4 class="text-lg font-medium">Name</h4>
                <p>
                  {selectedClient().first_name} {selectedClient().last_name}
                </p>
              </div>
              <div>
                <h4 class="text-lg font-medium">Phone</h4>
                <p>{formatPhoneNumber(selectedClient().phone)}</p>
              </div>
              <div>
                <h4 class="text-lg font-medium">Email</h4>
                <p>{selectedClient().email}</p>
              </div>
              <div>
                <h4 class="text-lg font-medium">Address</h4>
                <p>
                  {selectedClient().address +
                    " " +
                    selectedClient().city +
                    " " +
                    selectedClient().zip}
                </p>
              </div>
              <div>
                <h4 class="text-lg font-medium">Company</h4>
                <p>{selectedClient().company}</p>
              </div>
              {/* Add more fields as needed */}
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
}
