import { useFieldArray, useFormContext } from "react-hook-form";
import { DiscountArgs } from "server/domain/Stores/DiscountPolicy/Discount";

export interface FriendsFormValues {
  name: string;
  friends: FriendsFormValues[];
}

export default function useFriendsFormField(prefix: string) {
  const { control, register } = useFormContext<FriendsFormValues>();

  const nameInputPath = `${prefix}name` as "name";
  const friendsArrayInputPath = `${prefix}friends` as "friends";

  const { fields, append, remove } = useFieldArray({
    control,
    name: friendsArrayInputPath,
  });

  const addNewFriend = () => {
    append({
      name: "",
      friends: [],
    });
  };

  const removeFriend = (friendIndex: number) => () => {
    remove(friendIndex);
  };

  return {
    fields,
    register,
    addNewFriend,
    removeFriend,
    nameInputPath,
  };
}

// export function useDiscountFormField(prefix: string) {
//   const { control, register } = useFormContext<DiscountArgs>();

//   const nameInputPath = `${prefix}name` as "name";
//   const friendsArrayInputPath = `${prefix}friends` as "friends";

//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: friendsArrayInputPath,
//   });

//   const addNewFriend = () => {
//     append({
//       name: "",
//       friends: [],
//     });
//   };

//   const removeFriend = (friendIndex: number) => () => {
//     remove(friendIndex);
//   };

//   return {
//     fields,
//     register,
//     addNewFriend,
//     removeFriend,
//     nameInputPath,
//   };
// }
