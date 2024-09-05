export const roles = {
  roles: [
    {
      name: "admin",
      permissions: [
        "create_venue",
        "read_venue",
        "update_venue",
        "delete_venue",
        "create_reservation",
        "read_reservation",
        "delete_reservation",
      ],
    },
    {
      name: "user",
      permissions: [
        "read_venue",
        "create_reservation",
        "read_reservation",
        "delete_reservation",
      ],
    },
  ],
};

export type RoleKeys =
  | "create_venue"
  | "read_venue"
  | "update_venue"
  | "delete_venue"
  | "create_reservation"
  | "read_reservation"
  | "delete_reservation";
