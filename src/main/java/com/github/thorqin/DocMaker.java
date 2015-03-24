/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package com.github.thorqin;

import com.github.thorqin.webapi.HttpException;
import com.github.thorqin.webapi.annotation.App;
import com.github.thorqin.webapi.annotation.Entity;
import static com.github.thorqin.webapi.annotation.Entity.SourceType.HTTP_BODY;
import static com.github.thorqin.webapi.annotation.Entity.SourceType.QUERY_STRING;
import com.github.thorqin.webapi.annotation.WebEntry;
import static com.github.thorqin.webapi.annotation.WebEntry.HttpMethod.GET;
import static com.github.thorqin.webapi.annotation.WebEntry.HttpMethod.POST;
import com.github.thorqin.webapi.annotation.WebModule;
import com.github.thorqin.webapi.utility.Serializer;
import com.github.thorqin.webapi.validation.annotation.Validate;
import com.github.thorqin.webapi.validation.annotation.ValidateString;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URISyntaxException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;


@WebModule(path="/api")
public class DocMaker {
	@App
	Application application;
	public static class ActionEntity {
		@ValidateString(format="^quickstart\\.json|reference\\.json$")
		public String file;
		public String action;
	}
	@WebEntry(method={GET}, name="content")
	void getContent(@Entity(source=QUERY_STRING) @Validate ActionEntity action, 
			HttpServletRequest request, HttpServletResponse response) throws IOException, URISyntaxException {
		response.setContentType("application/json");
		response.setCharacterEncoding("utf-8");
		response.setHeader("Pragma", "no-cache");
		response.setHeader("Cache-Control", "no-store");
		response.setDateHeader("Expires", 0);
		File path = application.getValidConfigFile(action.file);
		try (InputStream in = new FileInputStream(path);) {
			byte[] buf = new byte[4096];
			OutputStream out = response.getOutputStream();
			int size;
			while ((size = in.read(buf)) > 0 )
				out.write(buf, 0, size);
		}
	}
	
	public static class SaveInfo {
		@ValidateString
		public String password;
		@Validate
		public Object content;
	}
	
	@WebEntry(method={POST}, name="content")
	void setContent(@Entity(source=QUERY_STRING) @Validate ActionEntity action,
			@Entity(source=HTTP_BODY) @Validate SaveInfo saveInfo,
			HttpServletRequest request, HttpServletResponse response) throws IOException, URISyntaxException {
		if (action.action.equals("save")) {
			File pwdConfig = application.getValidConfigFile("password.json");
			String password = Serializer.loadJsonFile(pwdConfig, String.class);
			if (saveInfo.password.equals(password)) {
				String path = application.getDataPath(action.file);
				Serializer.saveJsonFile(saveInfo.content, path, true);
			} else
				throw new HttpException(401, "Invalid Password!");
		} else
			throw new HttpException(400);
	}
	
	public static class VersionInfo {
		@ValidateString
		public String password;
		@ValidateString
		public String version;
	}
	
	@WebEntry(method={GET}, name="version")
	void setVersion(@Entity(source=QUERY_STRING) @Validate VersionInfo version) throws IOException, URISyntaxException {
		File pwdConfig = application.getValidConfigFile("password.json");
		String password = Serializer.loadJsonFile(pwdConfig, String.class);
		if (version.password.equals(password)) {
			String path = application.getDataPath("version.json");
			Serializer.saveJsonFile(version.version, path, true);
		} else
			throw new HttpException(401, "Invalid Password!");
	}
	
	@WebEntry(method={GET})
	void downloadRelease(HttpServletResponse response) throws IOException, URISyntaxException {
		File versionFile = application.getValidConfigFile("version.json");
		String version = Serializer.loadJsonFile(versionFile, String.class);
		response.sendRedirect("https://github.com/ThorQin/tui/releases/download/v" + version + "/tui-" + version + ".zip");
	}
	
	@WebEntry(method={GET})
	void downloadSrc(HttpServletResponse response) throws IOException, URISyntaxException {
		File versionFile = application.getValidConfigFile("version.json");
		String version = Serializer.loadJsonFile(versionFile, String.class);
		response.sendRedirect("https://github.com/ThorQin/tui/archive/v" + version + ".zip");
	}
}
