/*
 * Copyright (c) 2020 The Ontario Institute for Cancer Research. All rights reserved
 *
 * This program and the accompanying materials are made available under the terms of the GNU Affero General Public License v3.0.
 * You should have received a copy of the GNU Affero General Public License along with
 * this program. If not, see <http://www.gnu.org/licenses/>.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
 * SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
 * OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
 * IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
 * ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import React from "react";
import get from "lodash/get";
import Button from "@icgc-argo/uikit/Button";
import { ModalPortal } from "App";
import Modal from "@icgc-argo/uikit/Modal";
import useCancelRunMutation from "./../hooks/useCancelRunMutation";
import Typography from "@icgc-argo/uikit/Typography";
import { ApolloError } from "apollo-client";
import { useTheme } from "@icgc-argo/uikit/ThemeProvider";
import { useAuth } from "providers/Auth";
import { css } from "emotion";
import { GraphQLError, CancelRunResponse } from './../gql/types';

type ModalAction =
  | ((e: React.SyntheticEvent<HTMLButtonElement, Event>) => any)
  | undefined;

export const CancelConfirmModal = ({
  runId,
  onCancelCancelled,
  onCancelConfirmed,
}: {
  runId: string | boolean;
  onCancelCancelled: ModalAction;
  onCancelConfirmed: ModalAction;
}) => (
  <ModalPortal>
    <Modal
      title="Cancel Run"
      actionButtonText="Confirm Cancel"
      cancelText="Nevermind"
      onCancelClick={onCancelCancelled}
      onActionClick={onCancelConfirmed}
    >
      <Typography color={undefined} css={null}>
        Cancel run: <strong>{runId}</strong>
      </Typography>
    </Modal>
  </ModalPortal>
);

export const CancelResponseModal = ({
  cancelResponse,
  cancelError,
  onCancelAcknowledge,
}: {
  cancelResponse: CancelRunResponse | undefined | null;
  cancelError: ApolloError | GraphQLError[] | undefined | null;
  onCancelAcknowledge: ModalAction;
}) => {
  const theme = useTheme();
  return (
    <ModalPortal>
      <Modal
        title={cancelResponse ? `Workflow Run Cancelled` : `Cancel Run Error`}
        actionVisible={false}
        onCancelClick={onCancelAcknowledge}
        cancelText="Ok"
      >
        {cancelResponse && get(cancelResponse, 'cancelRun.runId') && (
          <Typography color={undefined} css={null}>
            Run with ID: <strong>{get(cancelResponse, 'cancelRun.runId')}</strong> has been
            cancelled.
          </Typography>
        )}
        {cancelError && (
          <>
            <Typography color={undefined} css={null}>
              The following error was encountered trying to cancel your
              workflow:
            </Typography>
            <div
              className={css`
                background: ${theme.colors.error_2};
                border: 2px solid ${theme.colors.error_1};
                border-radius: 3px;
                padding: 0 10px;
              `}
            >
              {cancelError instanceof Error && (
                <p>
                  <strong>Msg:</strong> {cancelError.message}
                </p>
              )}
              {cancelError instanceof Array && (
                <ul>
                  {cancelError.map((error, i) => (
                    <li key={`cancel-error-${i}`}>{error.message}</li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </Modal>
    </ModalPortal>
  );
};

export const CancelRunButton = ({
  run,
  variant = "primary",
  size = "md",
  setLoading,
  className,
}: {
  run: { runId: string; state: string };
  variant: "text" | "primary" | "secondary";
  size: "sm" | "md";
  setLoading: (isLoading: boolean) => void;
  className?: string;
}) => {
  const [cancelModalRunId, setCancelModalRunId] = React.useState<string>("");
  const [cancelResponse, setCancelResponse] = React.useState<CancelRunResponse | undefined | null>(null);
  const [cancelError, setCancelError] = React.useState<
    ApolloError | GraphQLError[] |  undefined | null
  >(null);
  const { isAdmin } = useAuth();
  const cancelRun = useCancelRunMutation();

  const onCancelClick = (runId: string) => {
    setCancelModalRunId(runId);
  };

  const onCancelConfirmed: React.ComponentProps<
    typeof Modal
  >["onActionClick"] = async () => {
    setLoading(true);
    try {
      const { data, errors } = await cancelRun(run.runId);
      setLoading(false);
      setCancelModalRunId("");
      if (errors && errors.length > 0) {
        setCancelError(errors);
      } else {
        setCancelResponse(data);
      }
    } catch (error) {
      setLoading(false);
      setCancelModalRunId("");
      setCancelError(error);
    }
  };

  const onCancelCancelled: React.ComponentProps<
    typeof Modal
  >["onCancelClick"] = () => {
    setCancelModalRunId("");
  };

  const onCancelAcknowledge: React.ComponentProps<
    typeof Button
  >["onClick"] = () => {
    setCancelResponse(null);
    setCancelError(null);
  };

  return (
    <>
      <Button
        onClick={() => onCancelClick(run.runId)}
        variant={variant}
        size={size}
        disabled={!isAdmin() || run.state !== "RUNNING"}
        className={className}
      >
        Cancel
      </Button>
      {cancelModalRunId && (
        <CancelConfirmModal
          runId={cancelModalRunId}
          onCancelCancelled={onCancelCancelled}
          onCancelConfirmed={onCancelConfirmed}
        />
      )}
      {(cancelResponse || cancelError) && (
        <CancelResponseModal
          cancelResponse={cancelResponse}
          cancelError={cancelError}
          onCancelAcknowledge={onCancelAcknowledge}
        />
      )}
    </>
  );
};
