defmodule SaladUI.Test.MixTaskCase do
  @moduledoc """
  This module provides helper functions for testing Mix tasks.
  """

  use ExUnit.CaseTemplate

  using do
    quote do
      import SaladUI.Test.MixTaskCase
    end
  end

  setup do
    # Get Mix output sent to the current
    # process to avoid polluting tests.
    Mix.shell(Mix.Shell.Process)

    on_exit(fn ->
      Mix.shell(Mix.Shell.IO)
    end)

    :ok
  end

  @doc """
  Makes an assertion about the output of a mix task.
  """
  def assert_mix_output(t, desired_output) do
    assert_received {:mix_shell, ^t, [^desired_output]}
  end

  @doc """
  Makes a negative assertion about the output of a mix task.
  """
  def refute_mix_output(t, undesired_output) do
    refute_received {:mix_shell, ^t, [^undesired_output]}
  end

  @doc """
  Creates a temporary directory for testing file operations.
  """
  def in_tmp(which, function) do
    base = Path.join([tmp_path(), random_string(10)])
    path = Path.join([base, to_string(which)])

    try do
      File.rm_rf!(path)
      File.mkdir_p!(path)
      File.cd!(path, function)
    after
      File.rm_rf!(base)
    end
  end

  def tmp_path do
    Path.expand("../../tmp", __DIR__)
  end

  defp random_string(len) do
    len |> :crypto.strong_rand_bytes() |> Base.url_encode64() |> binary_part(0, len)
  end
end
