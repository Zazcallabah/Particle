using System;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using Newtonsoft.Json;

namespace CreateStarMap
{
	class Program
	{
		static void Main( string[] args )
		{
			var str = File.ReadAllText( "hygxyz.csv", Encoding.UTF8 );
			var list = str.Split( new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries )
				.Skip( 1 )
				.Select( e => new Stardata2( e ) )
				.Where( s => s.Magnitude < 5 && (int) s.Dist != 10000000 ).ToArray();
			var _serializer = new JsonSerializer();
			var sb = new StringBuilder( 128 );
			var sw = new StringWriter( sb, CultureInfo.InvariantCulture );
			using( var jsonWriter = new JsonTextWriter( sw ) )
			{
				_serializer.Serialize( jsonWriter, list );
			}
			if( File.Exists( "c:\\src\\git\\Particle\\data.js" ) )
				File.Delete( "c:\\src\\git\\Particle\\data.js" );
			using( var target = File.OpenWrite( "c:\\src\\git\\Particle\\data.js" ) )
			{
				var targetWriter = new StreamWriter( target ) { AutoFlush = true };
				targetWriter.Write( "var _stardata = \"" + sw.ToString().Replace( "\"", "\\\"" ) + "\";" );
			}
		}

		static void Readbsc()
		{
			var str = File.ReadAllText( "bsc5-lite.dat", Encoding.UTF8 );
			var list = str.Split( new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries )
				.Select( e => new Stardata( e ) )
				.Where( Keep ).ToArray();


			var _serializer = new JsonSerializer();
			var sb = new StringBuilder( 128 );
			var sw = new StringWriter( sb, CultureInfo.InvariantCulture );
			using( var jsonWriter = new JsonTextWriter( sw ) )
			{
				_serializer.Serialize( jsonWriter, list );
			}
			if( File.Exists( "c:\\src\\git\\Particle\\data.js" ) )
				File.Delete( "c:\\src\\git\\Particle\\data.js" );
			using( var target = File.OpenWrite( "c:\\src\\git\\Particle\\data.js" ) )
			{
				var targetWriter = new StreamWriter( target ) { AutoFlush = true };
				targetWriter.Write( "var _stardata = \"" + sw.ToString().Replace( "\"", "\\\"" ) + "\";" );
			}

		}

		static bool Keep( Stardata sd )
		{
			if( sd.Magnitude > 4 )
				return false;
			var d = sd.GetOrgD();
			var r = sd.GetOrgR();
			if( r == 12 && d == 55 )
				return true;
			if( r == 12 && d == 57 )
				return true;
			if( r == 13 && d == 49 )
				return true;
			if( r == 13 && d == 54 )
				return true;
			if( r == 11 && d == 61 )
				return true;
			if( r == 11 && d == 53 )
				return true;
			if( r == 11 && d == 56 )
				return true;
			return false;

		}

	}

	class Stardata2
	{
		public double Magnitude { get; set; }
		public double AbsMag { get; set; }

		public double Tint { get; set; } // 0-blue, 0.5 sun, 1-red

		public double Dec { get; set; }
		public double RA { get; set; }
		public double Dist { get; set; }

		public Stardata2( string line )
		{
			var sp = line.Split( ',' );
			RA = Double.Parse( sp[7] );
			Dec = Double.Parse( sp[8] );
			Dist = Double.Parse( sp[9] );
			Magnitude = Double.Parse( sp[13] );
			AbsMag = Double.Parse( sp[14] );

			double tint;
			if( Double.TryParse( sp[16], out tint ) )
				Tint = tint;
			else
				Tint = 0.5;
		}
	}

	class Stardata
	{
		public override string ToString()
		{
			return string.Format( "m:{0} d:{1} r:{2}", Magnitude, Dec, RA );
		}
		public double Magnitude { get; set; }
		public double Dec { get; set; }
		public double RA { get; set; }
		double orgd;
		double orgr;
		public int GetOrgD()
		{
			return (int) orgd;
		}

		public int GetOrgR()
		{
			return (int) orgr;
		}

		public Stardata( string line )
		{
			var msub = line.Substring( 102, 5 );
			double m;
			if( Double.TryParse( msub, out m ) )
				Magnitude = m;
			else
				Magnitude = 100000;

			double d1, dm, ds;
			if(
				Double.TryParse( line.Substring( 84, 2 ), out d1 ) &&
				Double.TryParse( line.Substring( 86, 2 ), out dm ) &&
				Double.TryParse( line.Substring( 88, 2 ), out ds )
				)
			{
				Dec = ( d1 + ( dm / 60 ) + ( ds / 3600 ) ) * 2 * ( Math.PI / 360 );
				orgd = d1;
				if( line[83] == '-' )
					Dec *= -1;
			}
			else
				Dec = 0;

			double rh, rm, rs;
			if(
				Double.TryParse( line.Substring( 75, 2 ), out rh ) &&
				Double.TryParse( line.Substring( 77, 2 ), out rm ) &&
				Double.TryParse( line.Substring( 79, 4 ), out rs )
				)
			{
				RA = ( rh * ( Math.PI / 12 ) ) +
					( rm * ( Math.PI / 720 ) ) +
					( rs * ( Math.PI / 43200 ) );
				orgr = rh;
			}
			else
				Dec = 0;

		}
	}
}
