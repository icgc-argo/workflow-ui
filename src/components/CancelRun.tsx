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
import Button from "@icgc-argo/uikit/Button";
import { ModalPortal } from "App";
import Modal from "@icgc-argo/uikit/Modal";
import { cancelWorkflow } from "rdpc";
import Typography from "@icgc-argo/uikit/Typography";
import { ApolloError } from "apollo-boost";
import { useTheme } from "@icgc-argo/uikit/ThemeProvider";
import { css } from "emotion";

export type CancelSuccess = {
  run_id: string;
};

export type CancelError = {
  msg: String;
  status_code: Number;
};

export type CancelResponse = CancelSuccess | CancelError;

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
      <Typography>
        Cancel run: <strong>{runId}</strong>
      </Typography>
    </Modal>
  </ModalPortal>
);

export const CancelResponseModal = ({
  cancelResponse,
  onCancelAcknowledge,
}: {
  cancelResponse: CancelResponse | ApolloError;
  onCancelAcknowledge: ModalAction;
}) => {
  const theme = useTheme();
  return (
    <ModalPortal>
      <Modal
        title="Workflow Run Cancelled"
        actionVisible={false}
        onCancelClick={onCancelAcknowledge}
        cancelText="Ok"
      >
        {"run_id" in cancelResponse && (
          <Typography>
            Run with ID: <strong>{cancelResponse.run_id}</strong> has been
            cancelled.
          </Typography>
        )}
        {"msg" in cancelResponse && (
          <>
            <Typography>
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
              <p>
                <strong>Status:</strong> {cancelResponse.status_code}
                <strong>Msg:</strong> {cancelResponse.msg}
              </p>
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
  const [cancelResponse, setCancelResponse] = React.useState<
    CancelResponse | ApolloError | undefined | null
  >(null);

  const onCancelClick = (runId: string) => {
    setCancelModalRunId(runId);
  };

  const onCancelConfirmed: React.ComponentProps<
    typeof Modal
  >["onActionClick"] = async () => {
    setLoading(true);
    try {
      const cancelledRun = await cancelWorkflow(run.runId);
      setLoading(false);
      setCancelModalRunId("");
      setCancelResponse(cancelledRun);
    } catch (error) {
      setLoading(false);
      setCancelModalRunId("");
      setCancelResponse(error);
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
  };

  return (
    <>
      <Button
        onClick={() => onCancelClick(run.runId)}
        variant={variant}
        size={size}
        disabled={run.state !== "RUNNING"}
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
      {cancelResponse && (
        <CancelResponseModal
          cancelResponse={cancelResponse}
          onCancelAcknowledge={onCancelAcknowledge}
        />
      )}
    </>
  );
};
