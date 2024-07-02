import { withCompanyAuth } from "@/server/api/auth";
import { ApiError, ApiErrorResponses } from "@/server/api/error";
import type { PublicAPI } from "@/server/api/hono";
import { ApiSecuritiesSchema } from "@/server/api/schema/securities";
import { createRoute, z } from "@hono/zod-openapi";
import type { Company } from "@prisma/client";
import type { Context } from "hono";

export const RequestSchema = z.object({
  id: z
    .string()
    .cuid()
    .openapi({
      description: "Security ID",
      param: {
        name: "id",
        in: "path",
      },

      example: "cly405ci60000i7ngbiel3m5l",
    }),
});

const route = createRoute({
  method: "get",
  path: "/v1/companies/:id/securities",
  request: { params: RequestSchema },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: ApiSecuritiesSchema,
        },
      },
      description: "Get a security by ID",
    },

    ...ApiErrorResponses,
  },
});

const getMany = (app: PublicAPI) => {
  app.openapi(route, async (c: Context) => {
    const { company } = (await withCompanyAuth(c)) as { company: Company };

    if (!company) {
      throw new ApiError({
        code: "NOT_FOUND",
        message: "Company not found",
      });
    }

    // TODO: Implement the logic to get many securities
    return c.json(company, 200);
  });
};

export default getMany;
