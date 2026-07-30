defmodule SaladUI.Mix.Tasks.TwAnimateInstaller do
  @moduledoc false

  @tw_animate_css_url "https://raw.githubusercontent.com/Wombosvideo/tw-animate-css/refs/heads/main/src/tw-animate.css"
  @output_path "assets/vendor/tw-animate.css"

  def install(igniter) do
    Mix.shell().info("Downloading tw-animate.css")

    case download() do
      :ok -> :ok
      {:error, message} -> Mix.shell().error(message)
    end

    igniter
  end

  defp download do
    :inets.start()
    :ssl.start()

    case :httpc.request(:get, {@tw_animate_css_url, []}, [], body_format: :binary) do
      {:ok, {{_version, 200, _reason_phrase}, _headers, body}} ->
        @output_path |> Path.dirname() |> File.mkdir_p!()
        File.write!(@output_path, body)

      {:ok, {{_version, status_code, _reason_phrase}, _headers, _body}} ->
        {:error, "Failed to download tw-animate.css with status #{status_code}"}

      {:error, reason} ->
        {:error, "Failed to download tw-animate.css: #{inspect(reason)}"}
    end
  end
end
