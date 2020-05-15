// Copyright IBM Corp. 2018,2020. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {bind, Context, inject, Provider} from '@loopback/core';
import {asMiddleware, Middleware} from '@loopback/express';
import {HttpHandler} from '../http-handler';
import {RestBindings, RestTags} from '../keys';
import {RestMiddlewareGroups} from '../sequence';
import {FindRoute} from '../types';

export class FindRouteProvider {
  static value(
    @inject(RestBindings.Http.CONTEXT) context: Context,
    @inject(RestBindings.HANDLER) handler: HttpHandler,
  ): FindRoute {
    const findRoute: FindRoute = request => {
      const found = handler.findRoute(request);
      found.updateBindings(context);
      return found;
    };
    return findRoute;
  }
}

@bind(
  asMiddleware({
    group: RestMiddlewareGroups.FIND_ROUTE,
    chain: RestTags.REST_MIDDLEWARE_CHAIN,
  }),
)
export class FindRouteMiddlewareProvider implements Provider<Middleware> {
  constructor(
    @inject(RestBindings.SequenceActions.FIND_ROUTE)
    protected findRoute: FindRoute,
  ) {}

  value(): Middleware {
    return async (ctx, next) => {
      const route = this.findRoute(ctx.request);
      ctx.bind(RestBindings.Operation.ROUTE).to(route);
      return next();
    };
  }
}
