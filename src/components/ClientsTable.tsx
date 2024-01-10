import {
  createResource,
  For,
  ErrorBoundary,
  type ResourceFetcher,
  createSignal,
  Show,
  type JSX,
} from "solid-js";

export interface ClientEntry {
  [key: string]: any;
}

const fetcher: ResourceFetcher<true, ClientEntry[], ClientEntry> = async (
  _,
  { refetching, value },
) => {
  const res = await fetch("/api/clients", {
    method: refetching ? "POST" : "GET",
    body: refetching ? JSON.stringify(refetching) : null,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message);
  }

  const prev = value ?? [];
  return [...data, ...prev];
};

export function ClientsTable({ reviews }: { reviews: ClientEntry[] }) {
  const [data, { refetch }] = createResource(fetcher, {
    initialValue: reviews,
    ssrLoadFrom: "initial",
  });

  // Assuming you want to submit new data - if not, this can be removed
  const addClientHandler: JSX.EventHandler<HTMLFormElement, SubmitEvent> = (
    e,
  ) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    const first_name = formData.get("first_name")?.toString();
    const last_name = formData.get("last_name")?.toString();
    const phone = formData.get("phone")?.toString();
    const email = formData.get("email")?.toString();
    const address = formData.get("address")?.toString();
    const city = formData.get("city")?.toString();
    const zip = formData.get("zip")?.toString();
    const company = formData.get("company")?.toString();

    if (
      !first_name ||
      !last_name ||
      !phone ||
      !email ||
      !address ||
      !city ||
      !zip ||
      !company
    )
      return;
    refetch({
      first_name,
      last_name,
      phone,
      email,
      address,
      city,
      zip,
      company,
    });
    formElement.reset();
    toggleAddModal();
  };

  // State for managing modal visibility
  const [showEditModal, setShowEditModal] = createSignal(false);
  const [showAddModal, setShowAddModal] = createSignal(false);
  const [showDeleteModal, setShowDeleteModal] = createSignal(false);

  // Toggle functions for modals
  const toggleEditModal = () => setShowEditModal(!showEditModal());
  const toggleAddModal = () => setShowAddModal(!showAddModal());
  const toggleDeleteModal = () => setShowDeleteModal(!showDeleteModal());

  return (
    <div class="max-w-3xl w-full mx-auto">
      <ErrorBoundary fallback={<div>Something went wrong</div>}>
        <div class="container mx-auto mt-8">
          <div class="flex justify-between items-center bg-white p-4 rounded-md">
            <h1 class="text-lg font-bold">All Clients</h1>
            <div>
              <button
                onClick={toggleAddModal}
                class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
              >
                Add Client
              </button>
            </div>
          </div>
          <div class="bg-white shadow-md rounded my-6">
            <table class="min-w-full table-auto">
              <thead class="bg-gray-200">
                <tr>
                  {/* Headers - Adjust according to your data keys */}
                  <th class="px-6 py-3">
                    <input type="checkbox" />
                  </th>
                  <th class="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Name
                  </th>
                  <th class="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Phone
                  </th>
                  <th class="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Email
                  </th>
                  <th class="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Address
                  </th>
                  <th class="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Company
                  </th>
                  <th class="px-6 py-3 border-b border-gray-300 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white">
                <For each={data()}>
                  {(client) => (
                    <tr>
                      <td class="px-6 py-4">
                        <input type="checkbox" />
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        {client.first_name + " " + client.last_name}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        {client.phone_number}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        {client.email}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        {client.address + " " + client.city + " " + client.zip}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        {client.company}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a
                          href="#"
                          class="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </a>
                        <button
                          onclick={toggleDeleteModal}
                          class="text-red-600 hover:text-red-900 ml-4"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </div>

        {/* <!-- Add Client Modal --> */}
        <Show when={showAddModal()}>
          <div
            class="fixed left-0 right-0 z-50 items-center justify-center overflow-x-hidden overflow-y-auto top-4 md:inset-0 h-modal sm:h-full"
            id="add-user-modal"
          >
            <div class="relative w-full h-full max-w-2xl px-4 md:h-auto">
              {/* <!-- Modal content --> */}
              <div class="relative bg-white rounded-lg shadow dark:bg-gray-800">
                {/* <!-- Modal header --> */}
                <div class="flex items-start justify-between p-5 border-b rounded-t dark:border-gray-700">
                  <h3 class="text-xl font-semibold dark:text-white">
                    Add new client
                  </h3>
                  <button
                    type="button"
                    class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-700 dark:hover:text-white"
                    onClick={toggleAddModal}
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
                {/* <!-- Modal body --> */}
                <div class="p-6 space-y-6">
                  <form onSubmit={addClientHandler}>
                    <div class="grid grid-cols-6 gap-6">
                      <div class="col-span-6 sm:col-span-3">
                        <label
                          for="first-name"
                          class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          First Name
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          id="first_name"
                          class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="Bonnie"
                          required
                        />
                      </div>
                      <div class="col-span-6 sm:col-span-3">
                        <label
                          for="last_name"
                          class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          id="last_name"
                          class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="Green"
                          required
                        />
                      </div>
                      <div class="col-span-6 sm:col-span-3">
                        <label
                          for="phone"
                          class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="9545554444"
                          required
                        />
                      </div>
                      <div class="col-span-6 sm:col-span-3">
                        <label
                          for="email"
                          class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="example@company.com"
                          required
                        />
                      </div>
                      <div class="col-span-6">
                        <label
                          for="address"
                          class="block mb-2 w-full text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Address
                        </label>
                        <input
                          type="text"
                          name="address"
                          id="address"
                          class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="123 Lolipop Ln"
                        ></input>
                      </div>
                      <div class="col-span-6 sm:col-span-3">
                        <label
                          for="city"
                          class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          City
                        </label>
                        <input
                          type="text"
                          name="city"
                          id="city"
                          class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="Miami"
                          required
                        />
                      </div>
                      <div class="col-span-6 sm:col-span-3">
                        <label
                          for="zip"
                          class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Zip
                        </label>
                        <input
                          type="text"
                          name="zip"
                          id="zip"
                          class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="33180"
                          required
                        />
                      </div>
                      <div class="col-span-6 sm:col-span-3">
                        <label
                          for="company"
                          class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Company
                        </label>
                        <input
                          type="text"
                          name="company"
                          id="company"
                          class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="Company"
                          required
                        />
                      </div>
                    </div>
                    {/* <!-- Modal footer --> */}
                    <div class="items-center p-6 border-t border-gray-200 rounded-b dark:border-gray-700">
                      <button
                        class="text-white bg-black hover:bg-black-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                        type="submit"
                      >
                        Add client
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </Show>

        {/* // <!-- Edit User Modal --> */}
        <Show when={showEditModal()}>
          <div
            class="fixed left-0 right-0 z-50 items-center justify-center overflow-x-hidden overflow-y-auto top-4 md:inset-0 h-modal sm:h-full"
            id="edit-user-modal"
          >
            <div class="relative w-full h-full max-w-2xl px-4 md:h-auto">
              {/* <!-- Modal content --> */}
              <div class="relative bg-white rounded-lg shadow dark:bg-gray-800">
                {/* <!-- Modal header --> */}
                <div class="flex items-start justify-between p-5 border-b rounded-t dark:border-gray-700">
                  <h3 class="text-xl font-semibold dark:text-white">
                    Edit user
                  </h3>
                  <button
                    type="button"
                    class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-700 dark:hover:text-white"
                    data-modal-toggle="edit-user-modal"
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
                {/* <!-- Modal body --> */}
                <div class="p-6 space-y-6">
                  <form action="#">
                    <div class="grid grid-cols-6 gap-6">
                      <div class="col-span-6 sm:col-span-3">
                        <label
                          for="first-name"
                          class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          First Name
                        </label>
                        <input
                          type="text"
                          name="first-name"
                          value="Bonnie"
                          id="first-name"
                          class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="Bonnie"
                          required
                        />
                      </div>
                      <div class="col-span-6 sm:col-span-3">
                        <label
                          for="last-name"
                          class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="last-name"
                          value="Green"
                          id="last-name"
                          class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="Green"
                          required
                        />
                      </div>
                      <div class="col-span-6 sm:col-span-3">
                        <label
                          for="email"
                          class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value="bonnie@flowbite.com"
                          id="email"
                          class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="example@company.com"
                          required
                        />
                      </div>
                      <div class="col-span-6 sm:col-span-3">
                        <label
                          for="position"
                          class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Position
                        </label>
                        <input
                          type="text"
                          name="position"
                          value="React Developer"
                          id="position"
                          class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="e.g. React developer"
                          required
                        />
                      </div>
                      <div class="col-span-6 sm:col-span-3">
                        <label
                          for="current-password"
                          class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Current Password
                        </label>
                        <input
                          type="password"
                          name="current-password"
                          value="••••••••"
                          id="current-password"
                          class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                      <div class="col-span-6 sm:col-span-3">
                        <label
                          for="new-password"
                          class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          New Password
                        </label>
                        <input
                          type="password"
                          name="new-password"
                          value="••••••••"
                          id="new-password"
                          class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="••••••••"
                          required
                        />
                      </div>
                      <div class="col-span-6">
                        <label
                          for="biography"
                          class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Biography
                        </label>
                        <textarea
                          id="biography"
                          rows="4"
                          class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="👨‍💻Full-stack web developer. Open-source contributor."
                        >
                          👨‍💻Full-stack web developer. Open-source contributor.
                        </textarea>
                      </div>
                    </div>
                  </form>
                  {/* <!-- Modal footer --> */}
                  <div class="items-center p-6 border-t border-gray-200 rounded-b dark:border-gray-700">
                    <button
                      class="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                      type="submit"
                    >
                      Save all
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Show>

        {/* <!-- Delete User Modal --> */}
        <Show when={showDeleteModal()}>
          <div
            class="fixed left-0 right-0 z-50 items-center justify-center overflow-x-hidden overflow-y-auto top-4 md:inset-0 h-modal sm:h-full"
            id="delete-user-modal"
          >
            <div class="relative w-full h-full max-w-md px-4 md:h-auto">
              {/* <!-- Modal content --> */}
              <div class="relative bg-white rounded-lg shadow dark:bg-gray-800">
                {/* <!-- Modal header --> */}
                <div class="flex justify-end p-2">
                  <button
                    type="button"
                    class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-700 dark:hover:text-white"
                    onClick={toggleDeleteModal}
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
                {/* <!-- Modal body --> */}
                <div class="p-6 pt-0 text-center">
                  <svg
                    class="w-16 h-16 mx-auto text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <h3 class="mt-5 mb-6 text-lg text-gray-500 dark:text-gray-400">
                    Are you sure you want to delete this user?
                  </h3>
                  <a
                    href="#"
                    class="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-base inline-flex items-center px-3 py-2.5 text-center mr-2 dark:focus:ring-red-800"
                  >
                    Yes, I'm sure
                  </a>
                  <a
                    href="#"
                    class="text-gray-900 bg-white hover:bg-gray-100 focus:ring-4 focus:ring-primary-300 border border-gray-200 font-medium inline-flex items-center rounded-lg text-base px-3 py-2.5 text-center dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-gray-700"
                    data-modal-toggle="delete-user-modal"
                  >
                    No, cancel
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Show>
      </ErrorBoundary>
    </div>
  );
}
