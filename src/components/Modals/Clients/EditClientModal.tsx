import { Show, type JSX } from "solid-js";
const baseUrl = import.meta.env.BASE_URL;

export function EditClientModal({
  editSelectedClient,
  setEditSelectedClient,
  accessToken,
}) {
  const editClientHandler: JSX.EventHandler<
    HTMLFormElement,
    SubmitEvent
  > = async (e) => {
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
      !zip
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${baseUrl}/clients/${editSelectedClient().id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${accessToken.accessToken}`,
          },
          body: JSON.stringify({
            first_name,
            last_name,
            phone,
            email,
            address,
            city,
            zip,
            company,
          }),
        },
      );
      if (!response.ok) {
        throw new Error("Failed to add client:");
      }
    } catch (error) {
      console.error("Error adding client:", error);
    }

    formElement.reset();
    window.location.href = "/crud/clientSuccess";
  };
  return (
    <Show when={editSelectedClient()}>
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        aria-hidden="true"
      ></div>
      <div
        class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto"
        id="add-user-modal"
      >
        <div class="relative w-full h-full max-w-2xl px-4 md:h-auto">
          {/* <!-- Modal content --> */}
          <div class="relative bg-white rounded-lg shadow">
            {/* <!-- Modal header --> */}
            <div class="flex items-start justify-between p-5 border-b rounded-t">
              <h3 class="text-xl font-semibold">Edit client</h3>
              <button
                type="button"
                class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                onClick={() => setEditSelectedClient(null)}
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
              <form onSubmit={editClientHandler}>
                <div class="grid grid-cols-6 gap-6">
                  <div class="col-span-6 sm:col-span-3">
                    <label
                      for="first-name"
                      class="block mb-2 text-sm font-medium text-gray-900"
                    >
                      First Name
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      id="first_name"
                      class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 "
                      placeholder="Bonnie"
                      required
                      value={editSelectedClient().first_name}
                    />
                  </div>
                  <div class="col-span-6 sm:col-span-3">
                    <label
                      for="last_name"
                      class="block mb-2 text-sm font-medium text-gray-900 "
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      id="last_name"
                      class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5"
                      placeholder="Green"
                      required
                      value={editSelectedClient().last_name}
                    />
                  </div>
                  <div class="col-span-6 sm:col-span-3">
                    <label
                      for="phone"
                      class="block mb-2 text-sm font-medium text-gray-900"
                    >
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5      "
                      placeholder="9545554444"
                      required
                      value={editSelectedClient().phone}
                    />
                  </div>
                  <div class="col-span-6 sm:col-span-3">
                    <label
                      for="email"
                      class="block mb-2 text-sm font-medium text-gray-900 "
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5      "
                      placeholder="example@company.com"
                      required
                      value={editSelectedClient().email}
                    />
                  </div>
                  <div class="col-span-6">
                    <label
                      for="address"
                      class="block mb-2 w-full text-sm font-medium text-gray-900 "
                    >
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      id="address"
                      class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500      "
                      placeholder="123 Lolipop Ln"
                      value={editSelectedClient().address}
                    ></input>
                  </div>
                  <div class="col-span-6 sm:col-span-3">
                    <label
                      for="city"
                      class="block mb-2 text-sm font-medium text-gray-900 "
                    >
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      id="city"
                      class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5      "
                      placeholder="Miami"
                      required
                      value={editSelectedClient().city}
                    />
                  </div>
                  <div class="col-span-6 sm:col-span-3">
                    <label
                      for="zip"
                      class="block mb-2 text-sm font-medium text-gray-900 "
                    >
                      Zip
                    </label>
                    <input
                      type="text"
                      name="zip"
                      id="zip"
                      class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5      "
                      placeholder="33180"
                      required
                      value={editSelectedClient().zip}
                    />
                  </div>
                  <div class="col-span-6 sm:col-span-3">
                    <label
                      for="company"
                      class="block mb-2 text-sm font-medium text-gray-900 "
                    >
                      Company
                    </label>
                    <input
                      type="text"
                      name="company"
                      id="company"
                      class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5      "
                      placeholder="Company"
                      value={editSelectedClient().company}
                    />
                  </div>
                </div>
                {/* <!-- Modal footer --> */}
                <div class="items-center p-6 border-t border-gray-200 rounded-b ">
                  <button
                    class="text-white bg-black hover:bg-black-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                    type="submit"
                  >
                    Save changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
}
