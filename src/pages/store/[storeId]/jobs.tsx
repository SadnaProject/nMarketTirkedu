import Layout from "../../_layout";
import { useRouter } from "next/router";
import { z } from "zod";
import StoreNavbar from "components/storeNavbar";
import Input from "components/input";
import Button from "components/button";
import { CategoryDropdown } from "components/dropdown";
import { toast } from "react-hot-toast";
import { Modal } from "components/modal";

interface Job {
  id: string;
  name: string;
  title: "Founder" | "Owner" | "Manager";
  assignments: Job[];
}

const jobs: Job = {
  id: "0",
  name: "Omer Shahar",
  title: "Founder",
  assignments: [
    {
      id: "1",
      name: "Ron Ziskind",
      title: "Owner",
      assignments: [
        {
          id: "2",
          name: "Barman",
          title: "Manager",
          assignments: [],
        },
        {
          id: "3",
          name: "Ilay Zarfaty",
          title: "Owner",
          assignments: [],
        },
      ],
    },
    {
      id: "4",
      name: "Bar not man",
      title: "Owner",
      assignments: [],
    },
  ],
};

export default function Home() {
  const router = useRouter();
  const storeId = z.undefined().or(z.string()).parse(router.query.storeId);

  return (
    <Layout>
      <h1>The Happy Place</h1>
      {storeId && <StoreNavbar storeId={storeId} />}

      <div className="flex flex-wrap sm:flex-nowrap">
        <CategoryDropdown options={["Manager", "Owner"]} />
        <Input placeholder="Email" className="rounded-none" />
        <Button
          glowClassName="w-full"
          glowContainerClassName="w-full sm:w-auto"
          className="h-full w-full rounded-t-lg sm:rounded-lg sm:rounded-l-none"
        >
          Apply
        </Button>
      </div>
      <div className="hs-accordion-group w-full" data-hs-accordion-always-open>
        <Job job={jobs} />
      </div>
    </Layout>
  );
}

function FounderIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-6 w-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
      />
    </svg>
  );
}

function OwnerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-6 w-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </svg>
  );
}

function ManagerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-6 w-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
      />
    </svg>
  );
}

function AccordionIcons() {
  return (
    <>
      {" "}
      <svg
        className="block h-3 w-3 text-gray-600 group-hover:text-gray-500 hs-accordion-active:hidden hs-accordion-active:text-blue-600 hs-accordion-active:group-hover:text-blue-600"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2.62421 7.86L13.6242 7.85999"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M8.12421 13.36V2.35999"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <svg
        className="hidden h-3 w-3 text-gray-600 group-hover:text-gray-500 hs-accordion-active:block hs-accordion-active:text-blue-600 hs-accordion-active:group-hover:text-blue-600"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M2.62421 7.86L13.6242 7.85999"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </>
  );
}

function RemoveIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-6 w-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

type JobProps = {
  job: Job;
};

function Job({ job }: JobProps) {
  return (
    <div
      className="hs-accordion active"
      id={`hs-basic-always-open-heading-${job.id}`}
    >
      <button
        className="hs-accordion-toggle peer inline-flex items-center gap-x-3 py-3 text-left font-semibold text-gray-800 transition hs-accordion-active:text-blue-600 hover:text-gray-500"
        aria-controls={`hs-basic-always-open-collapse-${job.id}`}
      >
        {/* <AccordionIcons /> */}
        {job.title === "Founder" && <FounderIcon />}
        {job.title === "Owner" && <OwnerIcon />}
        {job.title === "Manager" && <ManagerIcon />}
        {job.name} - {job.title}
      </button>
      <button
        className="ml-2 peer-hover:opacity-100 hover:opacity-100 sm:opacity-0"
        data-hs-overlay={`#hs-modal-${job.id}`}
      >
        <RemoveIcon />
      </button>
      <Modal
        id={`hs-modal-${job.id}`}
        title="Confirm deletion"
        content={`Are you sure you want to remove ${job.name} (${job.title}) and the subordinates from the store?`}
        footer={
          <Button
            onClick={() => toast.success(job.id)}
            data-hs-overlay={`#hs-modal-${job.id}`}
          >
            Apply changes
          </Button>
        }
      />
      <div
        id={`hs-basic-always-open-collapse-${job.id}`}
        className="hs-accordion-content w-full overflow-hidden pl-6 transition-[height] duration-300"
        aria-labelledby={`hs-basic-always-open-heading-${job.id}`}
      >
        {job.assignments.map((assignment) => (
          <Job key={assignment.id} job={assignment} />
        ))}
      </div>
    </div>
  );
}