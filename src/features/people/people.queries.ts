import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { authKeys } from "@/features/auth/auth.keys";
import type { PersonListQuery } from "@/types";
import { createPerson, deletePerson, fetchPeoplePage, updatePerson } from "./people.api";
import { peopleKeys } from "./people.keys";

export function usePeoplePage(query: PersonListQuery) {
  return useQuery({
    queryKey: peopleKeys.list(query),
    queryFn: () => fetchPeoplePage(query),
    // A search, sort or page change keeps the old rows on screen until the new ones arrive.
    placeholderData: keepPreviousData,
  });
}

// A person shows in every list of people and pickers, and as the signed-in user in the sidebar.
function refreshPeople(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: peopleKeys.all }),
    queryClient.invalidateQueries({ queryKey: authKeys.all }),
  ]);
}

/** Adds a person; a toast names them. Returns the person, so a picker can choose them. */
export function useCreatePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPerson,
    onSuccess: (person) => {
      toast.success("Person added", { description: person.name });
      return refreshPeople(queryClient);
    },
    onError: (error) => toast.error("Couldn't add the person", { description: error.message }),
  });
}

export function useUpdatePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePerson,
    onSuccess: (person) => {
      toast.success("Person saved", { description: person.name });
      return refreshPeople(queryClient);
    },
    onError: (error) => toast.error("Couldn't save the person", { description: error.message }),
  });
}

export function useDeletePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deletePerson,
    onSuccess: () => {
      toast.success("Person removed");
      return refreshPeople(queryClient);
    },
    onError: (error) => toast.error("Couldn't remove the person", { description: error.message }),
  });
}
