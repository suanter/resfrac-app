/*
 * Copyright 2017 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

import { AuthorizationRequest } from "@openid/appauth/built/authorization_request";
import {
  AuthorizationNotifier,
  AuthorizationRequestHandler
} from "@openid/appauth/built/authorization_request_handler";
import { AuthorizationServiceConfiguration } from "@openid/appauth/built/authorization_service_configuration";
import { NodeCrypto } from '@openid/appauth/built/node_support/';
import { NodeBasedHandler } from "@openid/appauth/built/node_support/node_request_handler";
import { NodeRequestor } from "@openid/appauth/built/node_support/node_requestor";
import {
  GRANT_TYPE_AUTHORIZATION_CODE,
  GRANT_TYPE_REFRESH_TOKEN,
  TokenRequest
} from "@openid/appauth/built/token_request";
import {
  BaseTokenRequestHandler,
  TokenRequestHandler
} from "@openid/appauth/built/token_request_handler";
import {
  TokenResponse
} from "@openid/appauth/built/token_response";
import EventEmitter = require("events");

const log = console.log;
import { StringMap } from "@openid/appauth/built/types";

const axios = require('axios');

export class AuthStateEmitter extends EventEmitter {
  static ON_TOKEN_RESPONSE = "on_token_response";
}
/* the Node.js based HTTP client. */
const requestor = new NodeRequestor();
const openIdConnectUrl = "https://accounts.google.com";
const clientId =
  "511828570984-7nmej36h9j2tebiqmpqh835naet4vci4.apps.googleusercontent.com";
const redirectUri = "http://127.0.0.1:8000";
const scope = "openid";

export class AuthFlow {
  private user_data={}
  private notifier: AuthorizationNotifier;
  private authorizationHandler: AuthorizationRequestHandler;
  private tokenHandler: TokenRequestHandler;
  readonly authStateEmitter: AuthStateEmitter;

  // state
  private configuration: AuthorizationServiceConfiguration | undefined;

  private refreshToken: string | undefined;
  private accessTokenResponse: TokenResponse | undefined;

  constructor() {
    this.notifier = new AuthorizationNotifier();
    this.authStateEmitter = new AuthStateEmitter();
    this.authorizationHandler = new NodeBasedHandler();
    this.tokenHandler = new BaseTokenRequestHandler(requestor);
    // set notifier to deliver responses
    this.authorizationHandler.setAuthorizationNotifier(this.notifier);
    // set a listener to listen for authorization responses
    // make refresh and access token requests.
    this.notifier.setAuthorizationListener((request, response, error) => {
      log("Authorization request complete ", request, response, error);
      if (response) {
        console.log("Response from autorizing Listener");
        console.log(response);
        let codeVerifier: string | undefined;
        if(request.internal && request.internal.code_verifier) {
          codeVerifier = request.internal.code_verifier;
        }

        this.makeRefreshTokenRequest(response.code, codeVerifier)
          .then(result => this.performWithFreshTokens())
          .then((token:string) => {
            const instance =   axios.create({
              baseURL: "https://www.googleapis.com",
              timeout: 1000,
              headers: {'Authorization': 'Bearer '+token}
            });
            
            instance.get('/oauth2/v2/userinfo')
            .then(response => {
              let userData=response.data;
              userData['token'] = token;
              userData['logged'] = this.loggedIn();
              this.user_data=userData;
              this.authStateEmitter.emit(AuthStateEmitter.ON_TOKEN_RESPONSE,userData);
              log("All Done.");
            })
          });
      }
    });
  }
  getUserData(){
    if(this.user_data)
        return this.user_data;
  }
  fetchServiceConfiguration(): Promise<void> {
    return AuthorizationServiceConfiguration.fetchFromIssuer(
      openIdConnectUrl,
      requestor
    ).then(response => {
      log("Fetched service configuration", response);
      this.configuration = response;
    });
  }

  makeAuthorizationRequest(username?: string) {
    if (!this.configuration) {
      log("Unknown service configuration");
      return;
    }

    const extras: StringMap = { prompt: "consent", access_type: "offline" };
    if (username) {
      extras["login_hint"] = username;
    }
    // create a request
    const request = new AuthorizationRequest({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scope,
      response_type: AuthorizationRequest.RESPONSE_TYPE_CODE,
      state: undefined,
      extras: extras
    }, new NodeCrypto());

    log("Making authorization request ", this.configuration, request);

    this.authorizationHandler.performAuthorizationRequest(
      this.configuration,
      request
    );
  }

  private makeRefreshTokenRequest(code: string, codeVerifier: string|undefined): Promise<void> {
    if (!this.configuration) {
      log("Unknown service configuration");
      return Promise.resolve();
    }

    const extras: StringMap = {};

    if(codeVerifier) {
      extras.code_verifier = codeVerifier;
    }

    // use the code to make the token request.
    let request = new TokenRequest({
      client_id: clientId,
      redirect_uri: redirectUri,
      grant_type: GRANT_TYPE_AUTHORIZATION_CODE,
      code: code,
      refresh_token: undefined,
      extras: extras
    });

    return this.tokenHandler
      .performTokenRequest(this.configuration, request)
      .then(response => {
        log(`Refresh Token is ${response.refreshToken}`);
        this.refreshToken = response.refreshToken;
        this.accessTokenResponse = response;
        return response;
      })
      .then(() => {});
  }
  loggedIn(): boolean {
    return !!this.accessTokenResponse && this.accessTokenResponse.isValid();
  }

  signOut() {
    // forget all cached token state
    this.accessTokenResponse = undefined;
    this.user_data={}
  }
  performWithFreshTokens(): Promise<string> {
    if (!this.configuration) {
      log("Unknown service configuration");
      return Promise.reject("Unknown service configuration");
    }
    if (!this.refreshToken) {
      log("Missing refreshToken.");
      return Promise.resolve("Missing refreshToken.");
    }
    if (this.accessTokenResponse && this.accessTokenResponse.isValid()) {
      // do nothing
      return Promise.resolve(this.accessTokenResponse.accessToken);
    }
    let request = new TokenRequest({
      client_id: clientId,
      redirect_uri: redirectUri,
      grant_type: GRANT_TYPE_REFRESH_TOKEN,
      code: undefined,
      refresh_token: this.refreshToken,
      extras: undefined
    });

    return this.tokenHandler
      .performTokenRequest(this.configuration, request)
      .then(response => {
        this.accessTokenResponse = response;
        return response.accessToken;
      });
  }
}
